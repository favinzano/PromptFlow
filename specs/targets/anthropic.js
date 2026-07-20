// specs/targets/anthropic.js — destino Claude / Fable 5 · Opus 5 (mejores prácticas de Anthropic).
// Fuente: Anthropic prompting best practices (docs.claude.com).
export const id = 'anthropic';
export const vendorLabel = 'Anthropic';
export const siteLabel = 'Claude';
export const modelLabel = 'Claude Fable 5 / Opus 5'; // etiqueta configurable

export const principles = [
  '- Sé explícito y directo; incluye el "por qué" de las instrucciones para respuestas más certeras.',
  '- Estructura con etiquetas XML (<instructions>, <context>, <input>, <example>) para separar cada parte sin ambigüedad.',
  '- Asigna un rol claro al inicio (p. ej. "Eres un…") para enfocar tono y comportamiento.',
  '- Usa framing positivo: di qué SÍ debe hacer, no solo qué evitar.',
  '- Para documentos largos: coloca el contenido arriba en <document>, la consulta al final, y pide anclar la respuesta en citas.',
  '- Cuando ayuden, incluye 3-5 ejemplos consistentes y variados envueltos en <example>.'
].join('\n');
