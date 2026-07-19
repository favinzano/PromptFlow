// content/adapters/chatgpt.js
(function () {
  const PF = (self.PromptFlow = self.PromptFlow || {});
  PF.adapters = PF.adapters || {};

  PF.adapters.chatgpt = {
    id: 'chatgpt',
    matches: (host) => host === 'chatgpt.com' || host === 'chat.openai.com',
    // ChatGPT usa un contenteditable (o textarea en versiones antiguas) con este id.
    getEditor: () => document.getElementById('prompt-textarea')
  };
})();
