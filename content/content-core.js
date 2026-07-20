// content/content-core.js
// Bootstrap: detecta el sitio, monta la barra flotante cuando aparece el editor,
// y cablea "Mejorar" (vía background) e "Insertar de la biblioteca".
(function () {
  const PF = self.PromptFlow;
  if (!PF) return;

  const adapter = Object.values(PF.adapters).find((a) => a.matches(location.hostname));
  if (!adapter) return; // sitio no soportado

  function ensureUI() {
    // Solo mostramos la barra cuando existe un editor donde escribir.
    const hasEditor = !!adapter.getEditor();
    if (hasEditor && !PF.ui.isMounted()) {
      PF.ui.mount({ onEnhance, onLibrary });
    }
  }

  const RELOAD_HINT = 'La extensión se recargó. Refresca esta página (F5) e intenta de nuevo.';

  /**
   * sendMessage robusto: nunca deja la UI colgada. Maneja 3 fallos posibles:
   *  - contexto invalidado (extensión recargada) -> sendMessage lanza sincrónicamente
   *  - canal cerrado sin respuesta -> chrome.runtime.lastError
   *  - background lento/caído -> timeout
   */
  function sendMessageSafe(message, { timeout = 45000 } = {}) {
    return new Promise((resolve) => {
      let settled = false;
      const finish = (result) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(result);
      };
      const timer = setTimeout(() => finish({ ok: false, message: RELOAD_HINT }), timeout);

      try {
        chrome.runtime.sendMessage(message, (res) => {
          if (chrome.runtime.lastError) {
            finish({ ok: false, message: RELOAD_HINT });
            return;
          }
          finish({ ok: true, res });
        });
      } catch {
        // "Extension context invalidated": el content script quedó huérfano.
        finish({ ok: false, message: RELOAD_HINT });
      }
    });
  }

  async function onEnhance() {
    const el = adapter.getEditor();
    if (!el) {
      PF.ui.toast('No encontré el cuadro de texto de esta página.', 'error');
      return;
    }
    const text = PF.util.readEditor(el).trim();
    if (!text) {
      PF.ui.toast('Escribe una idea primero para poder optimizarla.', 'error');
      return;
    }

    PF.ui.setEnhanceState('loading');
    const out = await sendMessageSafe({ action: PF.MSG.ENHANCE, text, target: adapter.target });

    if (!out.ok || !out.res || !out.res.success) {
      const msg = out.res?.message || out.message || 'No se pudo mejorar el prompt. Intenta de nuevo.';
      PF.ui.setEnhanceState('error');
      PF.ui.toast(msg, 'error');
      return;
    }

    PF.util.setEditor(el, out.res.text);
    PF.ui.setEnhanceState('ok');
    if (out.res.targetLabel && out.res.categoryLabel) {
      PF.ui.toast(`Optimizado para ${out.res.targetLabel} · ${out.res.categoryLabel}`, 'info');
    }
  }

  async function onLibrary() {
    const out = await sendMessageSafe({ action: PF.MSG.GET_PROMPTS });
    if (!out.ok || !out.res) {
      PF.ui.toast(out.message || 'No se pudo cargar la biblioteca.', 'error');
      return;
    }
    const prompts = out.res.prompts || [];
    PF.ui.showPicker(prompts, (prompt) => {
      const el = adapter.getEditor();
      if (!el) {
        PF.ui.toast('No encontré el cuadro de texto de esta página.', 'error');
        return;
      }
      PF.util.insertEditor(el, prompt.body);
      PF.ui.hidePicker();
    });
  }

  // MutationObserver con debounce: reevalúa cuando el SPA reconstruye el DOM.
  let debounceTimer = null;
  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(ensureUI, 300);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  ensureUI();
})();
