// content/util.js
// Lectura/escritura genérica del editor, soportando <textarea> y contenteditable
// (ChatGPT, ProseMirror de Claude, Quill de Gemini). Así los adaptadores por sitio
// solo necesitan localizar el editor; la manipulación es común y menos frágil.
(function () {
  const PF = (self.PromptFlow = self.PromptFlow || {});

  function isTextarea(el) {
    return el && el.value !== undefined && typeof el.selectionStart === 'number';
  }

  function selectAll(el) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    const range = document.createRange();
    range.selectNodeContents(el);
    sel.addRange(range);
  }

  PF.util = {
    /** @returns {string} */
    readEditor(el) {
      if (!el) return '';
      if (el.value !== undefined) return el.value;
      return el.innerText || '';
    },

    /** Reemplaza TODO el contenido del editor. */
    setEditor(el, text) {
      if (!el) return;
      if (el.value !== undefined) {
        el.value = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }
      el.focus();
      selectAll(el);
      // insertText respeta el pipeline de input de editores ricos (ProseMirror/Quill).
      const ok = document.execCommand('insertText', false, text);
      if (!ok) {
        el.textContent = text;
        el.dispatchEvent(new InputEvent('input', { bubbles: true }));
      }
    },

    /** Inserta texto en la posición del cursor (sin borrar lo existente). */
    insertEditor(el, text) {
      if (!el) return;
      if (isTextarea(el)) {
        const start = el.selectionStart ?? el.value.length;
        const end = el.selectionEnd ?? el.value.length;
        el.value = el.value.slice(0, start) + text + el.value.slice(end);
        const pos = start + text.length;
        el.setSelectionRange(pos, pos);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }
      el.focus();
      const ok = document.execCommand('insertText', false, text);
      if (!ok) {
        el.textContent = (el.innerText || '') + text;
        el.dispatchEvent(new InputEvent('input', { bubbles: true }));
      }
    }
  };
})();
