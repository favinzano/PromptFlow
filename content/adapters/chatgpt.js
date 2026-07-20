// content/adapters/chatgpt.js
(function () {
  const PF = (self.PromptFlow = self.PromptFlow || {});
  PF.adapters = PF.adapters || {};

  PF.adapters.chatgpt = {
    id: 'chatgpt',
    target: 'openai', // optimizar para GPT-5.6 (mejores prácticas de OpenAI)
    matches: (host) => host === 'chatgpt.com' || host === 'chat.openai.com',
    // ChatGPT usa un contenteditable (o textarea en versiones antiguas) con este id.
    getEditor: () => document.getElementById('prompt-textarea')
  };
})();
