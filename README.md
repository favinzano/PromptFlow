# PromptFlow

Extensión de Chrome (Manifest V3) para trabajar mejor con IA: una **biblioteca de prompts**
reutilizable y un botón **Mejorar Prompt** que optimiza tu texto con IA — en ChatGPT, Claude y
Gemini.

## Funciones

- **Biblioteca de prompts** — guarda, organiza y reinserta tus prompts favoritos. Gratis, sin
  configuración, funciona offline.
- **Mejorar Prompt (BYOK)** — reescribe una idea cruda como un prompt estructurado usando tu propia
  API key. Proveedor por defecto: **Google Gemini** (capa gratuita de AI Studio). También soporta
  Groq (gratis), OpenAI y Anthropic.
- **Barra flotante** en ChatGPT / Claude / Gemini + **popup** como respaldo universal.

## Arquitectura

- Sin build step: JavaScript plano, la IA se llama vía `fetch()`.
- Capa `providers/` que abstrae el motor (permite añadir modelo local o proxy SaaS a futuro).
- La API key vive **solo** en `chrome.storage.local` y se lee **solo** en el service worker; el
  content script nunca la ve.

```
manifest.json          background.js (router + providers)
lib/        storage + mensajería
providers/  gemini · groq · openai · anthropic · registry
content/    barra flotante + adaptadores por sitio
popup/      biblioteca · mejorar · ajustes
```

## Instalación (desarrollo)

1. Abre `chrome://extensions`.
2. Activa el **Modo desarrollador**.
3. **Cargar descomprimida** → selecciona esta carpeta.

## Uso

1. **Biblioteca:** abre el popup → pestaña *Biblioteca* → guarda un prompt. En ChatGPT/Claude/Gemini
   pulsa **▤ Biblioteca** (barra abajo-derecha) para insertarlo.
2. **Configura tu key:** popup → *Ajustes* → elige Gemini → crea una API key gratis en
   [aistudio.google.com/apikey](https://aistudio.google.com/apikey) → pégala → Guardar.
3. **Mejora:** escribe una idea en el chat → pulsa **✦ Mejorar** → el editor se reemplaza con el
   prompt optimizado. (O usa la pestaña *Mejorar* del popup como respaldo.)

---

Marca: [Felipe Avinzano](https://felipeavinzano.com)
