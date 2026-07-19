// lib/storage.js
// Wrapper sobre chrome.storage.local para la biblioteca de prompts y los ajustes.
// SEGURIDAD: la apiKey vive SOLO aquí (storage.local) y solo se lee en el background.
// Nunca se sincroniza (no usamos storage.sync) ni se expone al content script.

const KEY_PROMPTS = 'promptflow.prompts';
const KEY_SETTINGS = 'promptflow.settings';

const DEFAULT_SETTINGS = Object.freeze({
  providerId: 'gemini',
  apiKey: '',
  model: '' // vacío => el provider usa su modelo por defecto
});

/**
 * @typedef {Object} Prompt
 * @property {string} id
 * @property {string} title
 * @property {string} body
 * @property {string[]} tags
 * @property {number} createdAt
 * @property {number} updatedAt
 */

/** @returns {Promise<Prompt[]>} */
export async function getPrompts() {
  const data = await chrome.storage.local.get(KEY_PROMPTS);
  const prompts = data[KEY_PROMPTS];
  return Array.isArray(prompts) ? prompts : [];
}

/**
 * Inserta o actualiza un prompt (upsert por id). Genera id/timestamps si es nuevo.
 * @param {Partial<Prompt>} input
 * @returns {Promise<Prompt>} el prompt guardado
 */
export async function savePrompt(input) {
  const title = (input.title || '').trim();
  const body = (input.body || '').trim();
  if (!body) {
    throw new Error('El prompt no puede estar vacío.');
  }

  const now = Date.now();
  const prompts = await getPrompts();
  const existingIndex = input.id ? prompts.findIndex((p) => p.id === input.id) : -1;

  const saved = {
    id: input.id || crypto.randomUUID(),
    title: title || body.slice(0, 40),
    body,
    tags: Array.isArray(input.tags) ? input.tags : [],
    createdAt: existingIndex >= 0 ? prompts[existingIndex].createdAt : now,
    updatedAt: now
  };

  const next =
    existingIndex >= 0
      ? prompts.map((p, i) => (i === existingIndex ? saved : p))
      : [saved, ...prompts];

  await chrome.storage.local.set({ [KEY_PROMPTS]: next });
  return saved;
}

/**
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deletePrompt(id) {
  const prompts = await getPrompts();
  const next = prompts.filter((p) => p.id !== id);
  await chrome.storage.local.set({ [KEY_PROMPTS]: next });
}

/** @returns {Promise<typeof DEFAULT_SETTINGS>} */
export async function getSettings() {
  const data = await chrome.storage.local.get(KEY_SETTINGS);
  const stored = data[KEY_SETTINGS] || {};
  return { ...DEFAULT_SETTINGS, ...stored };
}

/**
 * Fusiona ajustes parciales y guarda. Devuelve el objeto completo resultante.
 * @param {Partial<typeof DEFAULT_SETTINGS>} partial
 * @returns {Promise<typeof DEFAULT_SETTINGS>}
 */
export async function setSettings(partial) {
  const current = await getSettings();
  const next = { ...current, ...partial };
  await chrome.storage.local.set({ [KEY_SETTINGS]: next });
  return next;
}
