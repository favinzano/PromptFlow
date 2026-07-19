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

  function onEnhance() {
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
    chrome.runtime.sendMessage({ action: PF.MSG.ENHANCE, text }, (res) => {
      if (chrome.runtime.lastError || !res || !res.success) {
        const msg =
          res?.message ||
          chrome.runtime.lastError?.message ||
          'No se pudo mejorar el prompt. Intenta de nuevo.';
        PF.ui.setEnhanceState('error');
        PF.ui.toast(msg, 'error');
        return;
      }
      PF.util.setEditor(el, res.text);
      PF.ui.setEnhanceState('ok');
    });
  }

  function onLibrary() {
    chrome.runtime.sendMessage({ action: PF.MSG.GET_PROMPTS }, (res) => {
      if (chrome.runtime.lastError) {
        PF.ui.toast('No se pudo cargar la biblioteca.', 'error');
        return;
      }
      const prompts = res?.prompts || [];
      PF.ui.showPicker(prompts, (prompt) => {
        const el = adapter.getEditor();
        if (!el) {
          PF.ui.toast('No encontré el cuadro de texto de esta página.', 'error');
          return;
        }
        PF.util.insertEditor(el, prompt.body);
        PF.ui.hidePicker();
      });
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
