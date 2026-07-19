// providers/registry.js — resuelve providerId -> módulo, y expone metadatos para la UI de Ajustes.
import * as groq from './groq.js';
import * as gemini from './gemini.js';
import * as openai from './openai.js';
import * as anthropic from './anthropic.js';

export const DEFAULT_PROVIDER_ID = 'gemini';

// El orden define cómo aparecen en el selector de Ajustes (Gemini gratis primero).
const PROVIDERS = [gemini, groq, openai, anthropic];
const BY_ID = Object.fromEntries(PROVIDERS.map((p) => [p.id, p]));

/** @returns {typeof groq | null} */
export function getProvider(id) {
  return BY_ID[id] || null;
}

/** Metadatos serializables para poblar el <select> de proveedores y modelos. */
export function listProviders() {
  return PROVIDERS.map((p) => ({
    id: p.id,
    label: p.label,
    defaultModel: p.defaultModel,
    models: p.models,
    keyHint: p.keyHint
  }));
}
