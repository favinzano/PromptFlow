// specs/categories.js
// Taxonomía de categorías + matriz de transformaciones (destilada, compartida entre destinos).
// El modelo clasifica el prompt en UNA categoría y aplica solo estas reglas.

export const CATEGORIES = [
  'coding',
  'research',
  'writing',
  'image',
  'doc-analysis',
  'agent',
  'data',
  'general'
];

// Reglas operativas por categoría (concisas: entran en el system prompt).
export const CATEGORY_RULES = Object.freeze({
  coding:
    'Especifica lenguaje/framework/versiones, el contrato de entrada-salida y las restricciones; prohíbe features o dependencias no pedidas; pide pruebas cuando aplique.',
  research:
    'Delimita el alcance y las sub-preguntas, exige fuentes/citas y recencia, cubre las intenciones plausibles del usuario y pide una síntesis estructurada.',
  writing:
    'Fija audiencia, tono, longitud medible, formato/estructura y punto de vista; enumera los puntos que deben aparecer.',
  image:
    'Describe sujeto, estilo, composición, iluminación, medio, relación de aspecto y elementos a evitar; usa detalle visual concreto en vez de adjetivos vagos.',
  'doc-analysis':
    'Indica el documento/sección y el esquema de extracción; instruye "null si el dato falta, no inventes"; ancla las respuestas en citas del texto.',
  agent:
    'Define el objetivo, las herramientas disponibles y cuándo usarlas, las condiciones de parada, la verificación para acciones de alto impacto y el formato de salida/handoff.',
  data:
    'Define el dataset/columnas, la métrica o análisis exacto y el formato de salida (tabla/JSON); declara los supuestos y prohíbe cifras inventadas.',
  general:
    'Aclara el objetivo, añade el contexto necesario y especifica formato y longitud de salida.'
});

// Etiquetas legibles (ES) para la UI.
export const CATEGORY_LABELS = Object.freeze({
  coding: 'Programación',
  research: 'Investigación',
  writing: 'Escritura',
  image: 'Imágenes',
  'doc-analysis': 'Análisis de documentos',
  agent: 'Agentes / Automatización',
  data: 'Análisis de datos',
  general: 'General'
});

/** Normaliza una categoría recibida del modelo a una válida (fallback 'general'). */
export function normalizeCategory(cat) {
  const c = String(cat || '').trim().toLowerCase();
  return CATEGORIES.includes(c) ? c : 'general';
}
