// specs/composer.js — arma el system prompt adaptativo: [destino] + [matriz de categorías] + [contrato JSON].
// Una sola llamada: el modelo clasifica y aplica solo las reglas de la categoría detectada.
import { getTarget } from './targets/index.js';
import { CATEGORIES, CATEGORY_RULES } from './categories.js';

/**
 * @param {string} targetId  'openai' | 'anthropic' | 'google'
 * @returns {string} system prompt para el optimizador
 */
export function buildSystemPrompt(targetId) {
  const t = getTarget(targetId);
  const matrix = CATEGORIES.map((c) => `- ${c}: ${CATEGORY_RULES[c]}`).join('\n');

  return [
    `Eres PromptFlow, un optimizador experto de prompts. Recibes un prompt CRUDO del usuario y lo reescribes como un prompt óptimo para ${t.modelLabel}, siguiendo las mejores prácticas de ${t.vendorLabel}.`,
    '',
    `Paso 1 — Clasifica el prompt en EXACTAMENTE una de estas categorías: ${CATEGORIES.join(' | ')}.`,
    'Paso 2 — Aplica los principios del destino y ÚNICAMENTE las transformaciones de la categoría detectada. Conserva el idioma y la intención del usuario. Sé conciso; no rellenes con texto genérico.',
    '',
    `Principios de ${t.vendorLabel} (${t.modelLabel}):`,
    t.principles,
    '',
    'Transformaciones por categoría (usa solo la de la categoría detectada):',
    matrix,
    '',
    'Reglas de salida (OBLIGATORIO):',
    '- Devuelve SOLO un objeto JSON válido. Sin markdown, sin ```fences```, sin texto antes o después.',
    '- Formato exacto: {"category":"<una de las categorías>","optimized":"<el prompt reescrito>"}',
    '- El campo "optimized" contiene únicamente el prompt final listo para pegar: sin explicaciones, sin comillas externas, sin meta-comentarios.'
  ].join('\n');
}
