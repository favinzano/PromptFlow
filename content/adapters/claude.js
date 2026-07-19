// content/adapters/claude.js
(function () {
  const PF = (self.PromptFlow = self.PromptFlow || {});
  PF.adapters = PF.adapters || {};

  PF.adapters.claude = {
    id: 'claude',
    matches: (host) => host === 'claude.ai',
    // Claude usa el editor ProseMirror para redactar el mensaje.
    getEditor: () =>
      document.querySelector('div.ProseMirror[contenteditable="true"]') ||
      document.querySelector('[contenteditable="true"]')
  };
})();
