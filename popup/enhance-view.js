// popup/enhance-view.js — respaldo universal: elegir destino -> pegar texto -> optimizar -> copiar.
// Funciona en cualquier página (no depende de la inyección en el sitio de IA).
import { MSG, ERR } from '../lib/messages.js';
import { listTargets, DEFAULT_TARGET_ID } from '../specs/targets/index.js';

export function initEnhance(root) {
  const targets = listTargets();

  root.innerHTML = `
    <label class="pf-label" for="pf-en-target">Optimizar para</label>
    <select id="pf-en-target" class="pf-input"></select>
    <textarea id="pf-en-input" class="pf-textarea" rows="4" placeholder="Pega o escribe una idea cruda…"></textarea>
    <div class="pf-form-actions">
      <button id="pf-en-run" class="btn btn-primary">✦ Mejorar Prompt</button>
      <button id="pf-en-copy" class="btn btn-secondary" hidden>Copiar</button>
    </div>
    <p id="pf-en-status" class="pf-status" hidden></p>
    <textarea id="pf-en-output" class="pf-textarea pf-output" rows="6" placeholder="Aquí aparecerá el prompt optimizado…" readonly></textarea>
  `;

  const targetEl = root.querySelector('#pf-en-target');
  const inputEl = root.querySelector('#pf-en-input');
  const runBtn = root.querySelector('#pf-en-run');
  const copyBtn = root.querySelector('#pf-en-copy');
  const statusEl = root.querySelector('#pf-en-status');
  const outputEl = root.querySelector('#pf-en-output');

  for (const t of targets) {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = `${t.siteLabel} · ${t.modelLabel}`;
    targetEl.appendChild(opt);
  }
  targetEl.value = DEFAULT_TARGET_ID;

  function setStatus(text, kind) {
    if (!text) {
      statusEl.hidden = true;
      statusEl.textContent = '';
      return;
    }
    statusEl.hidden = false;
    statusEl.textContent = text;
    statusEl.className = kind === 'error' ? 'pf-status pf-status-error' : 'pf-status';
  }

  runBtn.addEventListener('click', () => {
    const text = inputEl.value.trim();
    if (!text) {
      inputEl.focus();
      return;
    }
    runBtn.disabled = true;
    runBtn.textContent = 'Procesando…';
    copyBtn.hidden = true;
    setStatus('', null);

    chrome.runtime.sendMessage(
      { action: MSG.ENHANCE, text, target: targetEl.value },
      (res) => {
        runBtn.disabled = false;
        runBtn.textContent = '✦ Mejorar Prompt';

        if (chrome.runtime.lastError || !res || !res.success) {
          const msg = res?.message || chrome.runtime.lastError?.message || 'No se pudo mejorar el prompt.';
          setStatus(msg, 'error');
          if (res?.error === ERR.NO_KEY) {
            const link = document.createElement('button');
            link.className = 'pf-link';
            link.textContent = 'Ir a Ajustes';
            link.addEventListener('click', () => window.dispatchEvent(new CustomEvent('promptflow:go-settings')));
            statusEl.appendChild(document.createTextNode(' '));
            statusEl.appendChild(link);
          }
          return;
        }

        outputEl.value = res.text;
        copyBtn.hidden = false;
        const cat = res.categoryLabel ? ` · ${res.categoryLabel}` : '';
        setStatus(`Optimizado para ${res.targetLabel}${cat}.`, null);
      }
    );
  });

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(outputEl.value);
      copyBtn.textContent = '¡Copiado!';
      setTimeout(() => (copyBtn.textContent = 'Copiar'), 1500);
    } catch {
      /* ignore */
    }
  });
}
