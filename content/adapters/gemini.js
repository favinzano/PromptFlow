// content/adapters/gemini.js
(function () {
  const PF = (self.PromptFlow = self.PromptFlow || {});
  PF.adapters = PF.adapters || {};

  PF.adapters.gemini = {
    id: 'gemini',
    target: 'google', // optimizar para Gemini 3.1 Pro (mejores prácticas de Google)
    matches: (host) => host === 'gemini.google.com',
    // Gemini usa el editor Quill (.ql-editor) dentro de <rich-textarea>.
    getEditor: () =>
      document.querySelector('rich-textarea .ql-editor[contenteditable="true"]') ||
      document.querySelector('.ql-editor[contenteditable="true"]') ||
      document.querySelector('[contenteditable="true"]')
  };
})();
