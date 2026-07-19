// lib/messages.js
// Constantes de mensajería compartidas por background y popup (módulos ES).
// Los content scripts NO pueden importar módulos: replican estos MISMOS strings
// en content/constants.js (mantener en sincronía).

export const MSG = Object.freeze({
  ENHANCE: 'ENHANCE',        // content/popup -> background: mejorar un texto con IA
  GET_PROMPTS: 'GET_PROMPTS' // content -> background: obtener la biblioteca de prompts
});

export const ERR = Object.freeze({
  NO_KEY: 'NO_KEY',                 // no hay API key configurada
  NO_PROVIDER: 'NO_PROVIDER',       // provider desconocido/no configurado
  EMPTY_INPUT: 'EMPTY_INPUT',       // texto vacío
  RATE_LIMIT: 'RATE_LIMIT',         // 429 del proveedor
  AUTH: 'AUTH',                     // 401/403 (key inválida)
  NETWORK: 'NETWORK',               // fallo de red / fetch
  PROVIDER: 'PROVIDER'              // otro error del proveedor
});
