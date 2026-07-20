// providers/gemini.js — Google Gemini (capa gratuita real vía AI Studio).
import { SYSTEM_PROMPT } from './system-prompt.js';
import { callJson, ProviderError } from './_shared.js';
import { ERR } from '../lib/messages.js';

export const id = 'gemini';
export const label = 'Google Gemini · gratis';
export const defaultModel = 'gemini-2.0-flash';
// flash-lite tiene límites de uso más altos (útil si aparece 429 en el free tier).
export const models = ['gemini-2.0-flash', 'gemini-2.0-flash-lite'];
export const keyHint = {
  text: 'Crea una API key gratis en aistudio.google.com/apikey',
  url: 'https://aistudio.google.com/apikey'
};

export async function enhance(text, { apiKey, model, systemPrompt }) {
  const m = model || defaultModel;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent`;

  const body = {
    systemInstruction: { parts: [{ text: systemPrompt || SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text }] }]
  };

  // La key va en header (x-goog-api-key), NO en la URL, para no filtrarla en logs.
  const data = await callJson(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify(body)
  });

  const parts = data?.candidates?.[0]?.content?.parts;
  const out = Array.isArray(parts) ? parts.map((p) => p.text).filter(Boolean).join('') : '';
  if (!out.trim()) {
    throw new ProviderError(ERR.PROVIDER, 'Gemini no devolvió texto (posible filtro de seguridad).');
  }
  return { text: out.trim() };
}
