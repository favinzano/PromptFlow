// content/ui.js
// Barra flotante (FAB) + selector de biblioteca + toasts. Sin frameworks.
// Todo dato del usuario se inserta con textContent (nunca innerHTML) para evitar inyección.
(function () {
  const PF = (self.PromptFlow = self.PromptFlow || {});

  const ENHANCE_LABELS = {
    idle: '✦ Mejorar',
    loading: 'Procesando…',
    ok: '¡Listo!',
    error: 'Reintentar'
  };

  let root = null;
  let enhanceBtn = null;
  let picker = null;
  let listEl = null;
  let searchEl = null;
  let emptyEl = null;
  let toastEl = null;
  let toastTimer = null;
  let resetTimer = null;
  let currentPrompts = [];
  let onPickCb = null;

  // Isotipo "La Incisión" (Felipe Avinzano), en negativo para el chip oscuro.
  const LOGO_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" aria-hidden="true">' +
    '<rect x="105" y="120" width="160" height="160" fill="#F4F1EB" transform="rotate(-4 185 200)"/>' +
    '<rect x="135" y="120" width="160" height="160" fill="none" stroke="#F4F1EB" stroke-width="12" transform="rotate(4 215 200)"/>' +
    '</svg>';

  function buildFab(handlers) {
    root = document.createElement('div');
    root.id = 'promptflow-fab';

    // Etiqueta de marca para que se identifique claramente como PromptFlow.
    const brand = document.createElement('div');
    brand.className = 'pf-brand';
    const logo = document.createElement('span');
    logo.className = 'pf-logo';
    logo.innerHTML = LOGO_SVG; // SVG estático de autor (sin datos de usuario)
    const word = document.createElement('span');
    word.className = 'pf-wordmark';
    // "Prompt" en Geist (sans), "Flow" en DM Serif Display (serif).
    word.innerHTML = '<span class="pf-wm-prompt">Prompt</span><span class="pf-wm-flow">Flow</span>';
    brand.appendChild(logo);
    brand.appendChild(word);

    const actions = document.createElement('div');
    actions.className = 'pf-actions';

    enhanceBtn = document.createElement('button');
    enhanceBtn.id = 'promptflow-enhance';
    enhanceBtn.className = 'pf-btn pf-btn-primary';
    enhanceBtn.textContent = ENHANCE_LABELS.idle;
    enhanceBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handlers.onEnhance();
    });

    const libBtn = document.createElement('button');
    libBtn.id = 'promptflow-library';
    libBtn.className = 'pf-btn pf-btn-secondary';
    libBtn.textContent = '▤ Biblioteca';
    libBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handlers.onLibrary();
    });

    actions.appendChild(enhanceBtn);
    actions.appendChild(libBtn);

    root.appendChild(brand);
    root.appendChild(actions);
    document.body.appendChild(root);
  }

  function buildPicker() {
    picker = document.createElement('div');
    picker.id = 'promptflow-picker';
    picker.hidden = true;

    const header = document.createElement('div');
    header.className = 'pf-picker-header';
    const title = document.createElement('span');
    title.textContent = 'Biblioteca de prompts';
    const close = document.createElement('button');
    close.className = 'pf-picker-close';
    close.textContent = '✕';
    close.addEventListener('click', hidePicker);
    header.appendChild(title);
    header.appendChild(close);

    searchEl = document.createElement('input');
    searchEl.className = 'pf-picker-search';
    searchEl.type = 'text';
    searchEl.placeholder = 'Buscar…';
    searchEl.addEventListener('input', () => renderList(searchEl.value));

    listEl = document.createElement('ul');
    listEl.className = 'pf-picker-list';

    emptyEl = document.createElement('p');
    emptyEl.className = 'pf-picker-empty';
    emptyEl.textContent = 'No hay prompts. Añádelos desde el popup de PromptFlow.';
    emptyEl.hidden = true;

    picker.appendChild(header);
    picker.appendChild(searchEl);
    picker.appendChild(listEl);
    picker.appendChild(emptyEl);
    document.body.appendChild(picker);

    // Cerrar al hacer clic fuera.
    document.addEventListener('click', (e) => {
      if (picker.hidden) return;
      if (picker.contains(e.target) || root.contains(e.target)) return;
      hidePicker();
    });
  }

  function renderList(filter) {
    const q = (filter || '').trim().toLowerCase();
    const items = q
      ? currentPrompts.filter(
          (p) =>
            (p.title || '').toLowerCase().includes(q) ||
            (p.body || '').toLowerCase().includes(q)
        )
      : currentPrompts;

    listEl.textContent = '';
    emptyEl.hidden = items.length > 0;

    for (const p of items) {
      const li = document.createElement('li');
      li.className = 'pf-picker-item';

      const t = document.createElement('span');
      t.className = 'pf-item-title';
      t.textContent = p.title || '(sin título)';

      const s = document.createElement('span');
      s.className = 'pf-item-snippet';
      s.textContent = (p.body || '').slice(0, 90);

      li.appendChild(t);
      li.appendChild(s);
      li.addEventListener('click', () => {
        if (onPickCb) onPickCb(p);
      });
      listEl.appendChild(li);
    }
  }

  function hidePicker() {
    if (picker) picker.hidden = true;
  }

  PF.ui = {
    mount(handlers) {
      if (root) return; // ya montado
      buildFab(handlers);
      buildPicker();
    },

    isMounted() {
      return !!root && document.body.contains(root);
    },

    setEnhanceState(state) {
      if (!enhanceBtn) return;
      enhanceBtn.textContent = ENHANCE_LABELS[state] || ENHANCE_LABELS.idle;
      enhanceBtn.classList.toggle('pf-loading', state === 'loading');
      enhanceBtn.disabled = state === 'loading';

      clearTimeout(resetTimer);
      if (state === 'ok' || state === 'error') {
        resetTimer = setTimeout(() => {
          enhanceBtn.textContent = ENHANCE_LABELS.idle;
          enhanceBtn.classList.remove('pf-loading');
        }, 2500);
      }
    },

    showPicker(prompts, onPick) {
      currentPrompts = Array.isArray(prompts) ? prompts : [];
      onPickCb = onPick;
      searchEl.value = '';
      renderList('');
      picker.hidden = false;
      searchEl.focus();
    },

    hidePicker,

    toast(message, type) {
      if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.id = 'promptflow-toast';
        document.body.appendChild(toastEl);
      }
      toastEl.textContent = message;
      toastEl.className = type === 'error' ? 'pf-toast-error' : 'pf-toast-info';
      toastEl.classList.add('pf-visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toastEl.classList.remove('pf-visible'), 4000);
    }
  };
})();
