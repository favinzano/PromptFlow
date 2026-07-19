// providers/anthropic.js — Anthropic Claude (BYOK de pago).
// Requiere el header anthropic-dangerous-direct-browser-access para llamadas desde navegador/extensión.
import { SYSTEM_PROMPT } from './system-prompt.js';
import { callJson, ProviderError } from './_shared.js';
import { ERR } from '../lib/messages.js';

export const id = 'anthropic';
export const label = 'Anthropic Claude';
export const defaultModel = 'claude-3-5-haiku-latest';
export const models = ['claude-3-5-haiku-latest', 'claude-3-5-sonnet-latest'];
export const keyHint = {
  text: 'Crea una API key en console.anthropic.com/settings/keys',
  url: 'https://console.anthropic.com/settings/keys'
};

export async function enhance(text, { apiKey, model }) {
  const body = {
    model: model || defaultModel,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: text }]
  };

  const data = await callJson('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify(body)
  });

  const out = Array.isArray(data?.content)
    ? data.content.map((b) => b.text).filter(Boolean).join('')
    : '';
  if (!out.trim()) {
    throw new ProviderError(ERR.PROVIDER, 'Claude no devolvió texto.');
  }
  return { text: out.trim() };
}
