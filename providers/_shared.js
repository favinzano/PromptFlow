// providers/_shared.js
// Utilidades compartidas por todos los providers: error normalizado + fetch JSON.

import { ERR } from '../lib/messages.js';

export class ProviderError extends Error {
  /**
   * @param {string} code  uno de ERR.*
   * @param {string} message  mensaje legible para el usuario
   */
  constructor(code, message) {
    super(message);
    this.name = 'ProviderError';
    this.code = code;
  }
}

/** Mapea un status HTTP a un código de error de la app. */
export function codeFromStatus(status) {
  if (status === 401 || status === 403) return ERR.AUTH;
  if (status === 429) return ERR.RATE_LIMIT;
  return ERR.PROVIDER;
}

/**
 * Hace fetch JSON y devuelve el objeto parseado, o lanza ProviderError normalizado.
 * @param {string} url
 * @param {RequestInit} options
 * @returns {Promise<any>}
 */
export async function callJson(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch (e) {
    throw new ProviderError(ERR.NETWORK, 'No se pudo conectar con el proveedor. Revisa tu conexión.');
  }

  if (!res.ok) {
    const detail = await safeErrorDetail(res);
    const code = codeFromStatus(res.status);
    const msg =
      code === ERR.AUTH
        ? 'API key inválida o sin permisos. Revisa tu key en Ajustes.'
        : code === ERR.RATE_LIMIT
        ? 'Límite de uso alcanzado (rate limit). Espera un momento e intenta de nuevo.'
        : `El proveedor respondió con un error (${res.status})${detail ? ': ' + detail : ''}.`;
    throw new ProviderError(code, msg);
  }

  try {
    return await res.json();
  } catch (e) {
    throw new ProviderError(ERR.PROVIDER, 'Respuesta ilegible del proveedor.');
  }
}

/** Intenta extraer un mensaje de error corto del cuerpo de la respuesta. */
async function safeErrorDetail(res) {
  try {
    const data = await res.clone().json();
    const m = data?.error?.message || data?.message || data?.error;
    return typeof m === 'string' ? m.slice(0, 160) : '';
  } catch {
    return '';
  }
}
