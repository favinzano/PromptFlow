// popup/popup.js — main: gestiona las pestañas y monta cada vista.
import { initLibrary } from './library-view.js';
import { initEnhance } from './enhance-view.js';
import { initSettings } from './settings-view.js';

const tabs = Array.from(document.querySelectorAll('.tab'));
const panels = {
  library: document.getElementById('panel-library'),
  enhance: document.getElementById('panel-enhance'),
  settings: document.getElementById('panel-settings')
};

function show(name) {
  for (const [key, el] of Object.entries(panels)) {
    el.hidden = key !== name;
  }
  for (const tab of tabs) {
    const active = tab.dataset.tab === name;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  }
}

for (const tab of tabs) {
  tab.addEventListener('click', () => show(tab.dataset.tab));
}

// Permite saltar a Ajustes desde otras vistas (p. ej. cuando falta la API key).
window.addEventListener('promptflow:go-settings', () => show('settings'));

initLibrary(panels.library);
initEnhance(panels.enhance);
initSettings(panels.settings);
show('library');
