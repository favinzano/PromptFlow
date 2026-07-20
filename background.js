// background.js — Service worker (module). Router de mensajes.
// Único lugar que lee la API key y llama al proveedor optimizador. Compone el system prompt
// adaptativo según el destino (sitio) y devuelve el prompt optimizado + la categoría detectada.
import { MSG, ERR } from './lib/messages.js';
import { getSettings, getPrompts } from './lib/storage.js';
import { getProvider } from './providers/registry.js';
import { ProviderError } from './providers/_shared.js';
import { buildSystemPrompt } from './specs/composer.js';
import { getTarget, DEFAULT_TARGET_ID } from './specs/targets/index.js';
import { CATEGORY_LABELS, normalizeCategory } from './specs/categories.js';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.action === MSG.ENHANCE) {
    handleEnhance(message.text, message.target)
      .then(sendResponse)
      .catch(() => sendResponse(fail(ERR.PROVIDER, 'Error inesperado. Intenta de nuevo.')));
    return true; // canal abierto para respuesta asíncrona
  }

  if (message?.action === MSG.GET_PROMPTS) {
    getPrompts()
      .then((prompts) => sendResponse({ success: true, prompts }))
      .catch(() => sendResponse({ success: false, prompts: [] }));
    return true;
  }

  return false;
});

/**
 * @param {string} text
 * @param {string} targetId  destino según el sitio ('openai' | 'anthropic' | 'google')
 */
async function handleEnhance(text, targetId) {
  const input = (text || '').trim();
  if (!input) {
    return fail(ERR.EMPTY_INPUT, 'Escribe un texto primero para poder mejorarlo.');
  }

  const settings = await getSettings();
  if (!settings.apiKey) {
    return fail(ERR.NO_KEY, 'Configura tu API key en Ajustes para usar Mejorar Prompt.');
  }

  const provider = getProvider(settings.providerId);
  if (!provider) {
    return fail(ERR.NO_PROVIDER, 'Proveedor no válido. Revisa Ajustes.');
  }

  const target = getTarget(targetId || DEFAULT_TARGET_ID);
  const systemPrompt = buildSystemPrompt(target.id);
  const model = provider.models.includes(settings.model) ? settings.model : provider.defaultModel;

  try {
    const { text: raw } = await provider.enhance(input, {
      apiKey: settings.apiKey,
      model,
      systemPrompt
    });
    const { category, optimized } = parseOptimized(raw);
    return {
      success: true,
      text: optimized,
      category,
      categoryLabel: CATEGORY_LABELS[category] || CATEGORY_LABELS.general,
      targetLabel: target.modelLabel
    };
  } catch (e) {
    if (e instanceof ProviderError) {
      return fail(e.code, e.message);
    }
    console.error('PromptFlow: fallo inesperado en enhance', e?.name || 'Error');
    return fail(ERR.PROVIDER, 'Ocurrió un error al procesar el prompt. Intenta de nuevo.');
  }
}

/**
 * Parsea la salida del modelo como {category, optimized}. Es defensivo: tolera fences de
 * markdown y texto alrededor; si no encuentra JSON válido, usa el texto crudo como prompt.
 * @returns {{category: string, optimized: string}}
 */
function parseOptimized(raw) {
  const text = (raw || '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start >= 0 && end > start) {
    try {
      const obj = JSON.parse(text.slice(start, end + 1));
      if (obj && typeof obj.optimized === 'string' && obj.optimized.trim()) {
        return { category: normalizeCategory(obj.category), optimized: obj.optimized.trim() };
      }
    } catch {
      /* cae al fallback */
    }
  }

  // Fallback: el modelo no devolvió JSON; usamos el texto tal cual (sin fences).
  const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  return { category: 'general', optimized: cleaned || text };
}

function fail(error, messageText) {
  return { success: false, error, message: messageText };
}
