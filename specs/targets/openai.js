// specs/targets/openai.js — destino ChatGPT / GPT-5.6 (mejores prácticas de OpenAI).
// Fuente: OpenAI GPT-5 prompting guide (developers.openai.com/cookbook).
export const id = 'openai';
export const vendorLabel = 'OpenAI';
export const siteLabel = 'ChatGPT';
export const modelLabel = 'GPT-5.6'; // etiqueta configurable

export const principles = [
  '- Da un objetivo claro, restricciones duras y un contrato de salida explícito; no prescribas cada paso intermedio (es un modelo de razonamiento).',
  '- No añadas "piensa paso a paso" ni andamiaje de razonamiento forzado; puede degradar el resultado.',
  '- Fija el alcance: pide exactamente y solo lo solicitado, sin extras ni adornos no pedidos.',
  '- Define un techo de verbosidad y, si la salida es estructurada, un esquema con campos (requeridos vs opcionales).',
  '- Ante ambigüedad, instruye a ofrecer 2-3 interpretaciones con supuestos etiquetados, o 1-3 preguntas de aclaración.'
].join('\n');
