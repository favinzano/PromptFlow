// providers/openai.js — OpenAI (BYOK de pago).
import { makeOpenAICompatible } from './_openaiCompatible.js';

export const id = 'openai';
export const label = 'OpenAI';
export const defaultModel = 'gpt-4o-mini';
export const models = ['gpt-4o-mini', 'gpt-4o'];
export const keyHint = {
  text: 'Crea una API key en platform.openai.com/api-keys',
  url: 'https://platform.openai.com/api-keys'
};

export const enhance = makeOpenAICompatible({
  endpoint: 'https://api.openai.com/v1/chat/completions',
  authHeader: (apiKey) => ({ Authorization: `Bearer ${apiKey}` })
});
