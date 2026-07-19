// popup/library-view.js — CRUD de la biblioteca de prompts.
import { getPrompts, savePrompt, deletePrompt } from '../lib/storage.js';

export function initLibrary(root) {
  root.innerHTML = `
    <form id="pf-form" class="pf-form">
      <input id="pf-title" class="pf-input" type="text" placeholder="Título (opcional)" />
      <textarea id="pf-body" class="pf-textarea" rows="4" placeholder="Escribe tu prompt…"></textarea>
      <div class="pf-form-actions">
        <button type="submit" class="btn btn-primary">Guardar</button>
        <button type="button" id="pf-cancel" class="btn btn-secondary" hidden>Cancelar</button>
      </div>
    </form>
    <p class="caption">Tus prompts</p>
    <ul id="pf-list" class="pf-list"></ul>
  `;

  const form = root.querySelector('#pf-form');
  const titleEl = root.querySelector('#pf-title');
  const bodyEl = root.querySelector('#pf-body');
  const cancelBtn = root.querySelector('#pf-cancel');
  const listEl = root.querySelector('#pf-list');

  let editingId = null;

  function resetForm() {
    editingId = null;
    titleEl.value = '';
    bodyEl.value = '';
    cancelBtn.hidden = true;
  }

  async function render() {
    const prompts = await getPrompts();
    listEl.textContent = '';

    if (prompts.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'pf-empty';
      empty.textContent = 'Aún no tienes prompts. Guarda el primero arriba.';
      listEl.appendChild(empty);
      return;
    }

    for (const p of prompts) {
      const li = document.createElement('li');
      li.className = 'pf-list-item';

      const info = document.createElement('div');
      info.className = 'pf-list-info';
      const title = document.createElement('span');
      title.className = 'pf-list-title';
      title.textContent = p.title || '(sin título)';
      const snippet = document.createElement('span');
      snippet.className = 'pf-list-snippet';
      snippet.textContent = p.body.slice(0, 80);
      info.appendChild(title);
      info.appendChild(snippet);

      const actions = document.createElement('div');
      actions.className = 'pf-list-actions';
      actions.appendChild(iconBtn('Copiar', () => copy(p.body)));
      actions.appendChild(
        iconBtn('Editar', () => {
          editingId = p.id;
          titleEl.value = p.title;
          bodyEl.value = p.body;
          cancelBtn.hidden = false;
          titleEl.focus();
        })
      );
      actions.appendChild(
        iconBtn('Borrar', async () => {
          await deletePrompt(p.id);
          if (editingId === p.id) resetForm();
          render();
        })
      );

      li.appendChild(info);
      li.appendChild(actions);
      listEl.appendChild(li);
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = bodyEl.value.trim();
    if (!body) {
      bodyEl.focus();
      return;
    }
    await savePrompt({ id: editingId || undefined, title: titleEl.value.trim(), body });
    resetForm();
    render();
  });

  cancelBtn.addEventListener('click', resetForm);

  render();
}

function iconBtn(label, onClick) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'pf-icon-btn';
  b.textContent = label;
  b.addEventListener('click', onClick);
  return b;
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* clipboard puede fallar sin foco; se ignora silenciosamente */
  }
}
