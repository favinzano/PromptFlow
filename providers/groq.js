// providers/groq.js — Groq (capa gratuita real, muy rápido). Provider por defecto.
import { makeOpenAICompatible } from './_openaiCompatible.js';

export const id = 'groq';
export const label = 'Groq · gratis';
export const defaultModel = 'llama-3.3-70b-versatile';
export const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
export const keyHint = {
  text: 'Crea una API key gratis en console.groq.com/keys',
  url: 'https://console.groq.com/keys'
};

export const enhance = makeOpenAICompatible({
  endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  authHeader: (apiKey) => ({ Authorization: `Bearer ${apiKey}` })
});
