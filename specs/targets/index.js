// specs/targets/index.js — registro de destinos.
import * as openai from './openai.js';
import * as anthropic from './anthropic.js';
import * as google from './google.js';

const TARGETS = { openai, anthropic, google };
export const DEFAULT_TARGET_ID = 'openai';

/** Devuelve el destino por id (fallback al destino por defecto). */
export function getTarget(id) {
  return TARGETS[id] || TARGETS[DEFAULT_TARGET_ID];
}

/** Metadatos para poblar el selector de destino en el popup. */
export function listTargets() {
  return Object.values(TARGETS).map((t) => ({
    id: t.id,
    vendorLabel: t.vendorLabel,
    siteLabel: t.siteLabel,
    modelLabel: t.modelLabel
  }));
}
