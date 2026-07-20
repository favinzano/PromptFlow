// specs/targets/google.js — destino Gemini / Gemini 3.1 Pro (mejores prácticas de Google).
// Fuente: Gemini 3 prompting guide + prompt design strategies (ai.google.dev / cloud.google.com).
export const id = 'google';
export const vendorLabel = 'Google Gemini';
export const siteLabel = 'Gemini';
export const modelLabel = 'Gemini 3.1 Pro'; // etiqueta configurable

export const principles = [
  '- Sé preciso y directo; define cualquier término ambiguo antes de usarlo.',
  '- Usa delimitadores consistentes en todo el prompt (etiquetas XML o encabezados Markdown, no mezcles).',
  '- Coloca la petición central y las restricciones críticas (sobre todo las negativas) AL FINAL, con un puente tipo "Basado en lo anterior…".',
  '- Cambia cualificadores subjetivos por medibles ("≤3 frases" en vez de "breve").',
  '- Few-shot con formato idéntico entre ejemplos; evita el exceso que provoque overfitting.',
  '- Pide la verbosidad deseada de forma explícita (Gemini responde conciso por defecto).'
].join('\n');
