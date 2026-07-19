// popup/settings-view.js — elegir proveedor + modelo + API key (BYOK).
import { getSettings, setSettings } from '../lib/storage.js';
import { listProviders } from '../providers/registry.js';

export function initSettings(root) {
  const providers = listProviders();

  root.innerHTML = `
    <label class="pf-label" for="pf-provider">Proveedor</label>
    <select id="pf-provider" class="pf-input"></select>

    <label class="pf-label" for="pf-model">Modelo</label>
    <select id="pf-model" class="pf-input"></select>

    <label class="pf-label" for="pf-key">API key</label>
    <div class="pf-key-row">
      <input id="pf-key" class="pf-input" type="password" placeholder="Pega tu API key…" autocomplete="off" />
      <button id="pf-key-toggle" type="button" class="pf-icon-btn" title="Mostrar/ocultar">👁</button>
    </div>
    <p id="pf-key-hint" class="pf-hint"></p>

    <button id="pf-save" class="btn btn-primary">Guardar ajustes</button>
    <p id="pf-save-status" class="pf-status" hidden></p>
  `;

  const providerEl = root.querySelector('#pf-provider');
  const modelEl = root.querySelector('#pf-model');
  const keyEl = root.querySelector('#pf-key');
  const keyToggle = root.querySelector('#pf-key-toggle');
  const hintEl = root.querySelector('#pf-key-hint');
  const saveBtn = root.querySelector('#pf-save');
  const statusEl = root.querySelector('#pf-save-status');

  for (const p of providers) {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.label;
    providerEl.appendChild(opt);
  }

  function providerById(id) {
    return providers.find((p) => p.id === id) || providers[0];
  }

  function renderModels(providerId, selectedModel) {
    const provider = providerById(providerId);
    modelEl.textContent = '';
    for (const m of provider.models) {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      modelEl.appendChild(opt);
    }
    modelEl.value = provider.models.includes(selectedModel) ? selectedModel : provider.defaultModel;
  }

  function renderHint(providerId) {
    const provider = providerById(providerId);
    hintEl.textContent = '';
    if (provider.keyHint) {
      const a = document.createElement('a');
      a.href = provider.keyHint.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = provider.keyHint.text;
      hintEl.appendChild(a);
    }
  }

  providerEl.addEventListener('change', () => {
    renderModels(providerEl.value, '');
    renderHint(providerEl.value);
  });

  keyToggle.addEventListener('click', () => {
    keyEl.type = keyEl.type === 'password' ? 'text' : 'password';
  });

  saveBtn.addEventListener('click', async () => {
    await setSettings({
      providerId: providerEl.value,
      model: modelEl.value,
      apiKey: keyEl.value.trim()
    });
    statusEl.hidden = false;
    statusEl.textContent = '✓ Ajustes guardados.';
    statusEl.className = 'pf-status';
    setTimeout(() => (statusEl.hidden = true), 2000);
  });

  // Cargar estado actual.
  (async () => {
    const s = await getSettings();
    providerEl.value = providers.some((p) => p.id === s.providerId) ? s.providerId : providers[0].id;
    renderModels(providerEl.value, s.model);
    renderHint(providerEl.value);
    keyEl.value = s.apiKey || '';
  })();
}
