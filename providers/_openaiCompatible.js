// providers/_openaiCompatible.js
// Fábrica para proveedores con el shape "OpenAI Chat Completions" (Groq, OpenAI, OpenRouter...).

import { SYSTEM_PROMPT } from './system-prompt.js';
import { callJson, ProviderError } from './_shared.js';
import { ERR } from '../lib/messages.js';

/**
 * @param {{ endpoint: string, authHeader: (apiKey: string) => Record<string,string>, extraHeaders?: Record<string,string> }} cfg
 * @returns {(text: string, opts: { apiKey: string, model: string, systemPrompt?: string }) => Promise<{ text: string }>}
 */
export function makeOpenAICompatible({ endpoint, authHeader, extraHeaders = {} }) {
  return async function enhance(text, { apiKey, model, systemPrompt }) {
    const body = {
      model,
      messages: [
        { role: 'system', content: systemPrompt || SYSTEM_PROMPT },
        { role: 'user', content: text }
      ],
      temperature: 0.7
    };

    const data = await callJson(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...extraHeaders,
        ...authHeader(apiKey)
      },
      body: JSON.stringify(body)
    });

    const out = data?.choices?.[0]?.message?.content;
    if (!out || !out.trim()) {
      throw new ProviderError(ERR.PROVIDER, 'El proveedor no devolvió texto.');
    }
    return { text: out.trim() };
  };
}
