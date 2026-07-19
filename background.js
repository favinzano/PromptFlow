// background.js — Service worker (module). Router de mensajes.
// Es el ÚNICO lugar que lee la API key y llama a los proveedores. El content script
// nunca ve la key: solo pide "ENHANCE" y recibe el texto ya procesado.
import { MSG, ERR } from './lib/messages.js';
import { getSettings, getPrompts } from './lib/storage.js';
import { getProvider } from './providers/registry.js';
import { ProviderError } from './providers/_shared.js';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.action === MSG.ENHANCE) {
    handleEnhance(message.text).then(sendResponse);
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
 * @returns {Promise<{success:true,text:string} | {success:false,error:string,message:string}>}
 */
async function handleEnhance(text) {
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

  const model = settings.model || provider.defaultModel;
  try {
    const { text: enhanced } = await provider.enhance(input, { apiKey: settings.apiKey, model });
    return { success: true, text: enhanced };
  } catch (e) {
    if (e instanceof ProviderError) {
      return fail(e.code, e.message);
    }
    console.error('PromptFlow: fallo inesperado en enhance', e?.name || 'Error');
    return fail(ERR.PROVIDER, 'Ocurrió un error al procesar el prompt. Intenta de nuevo.');
  }
}

function fail(error, messageText) {
  return { success: false, error, message: messageText };
}
