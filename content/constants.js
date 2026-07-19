// content/constants.js
// Los content scripts NO pueden importar módulos ES; comparten el objeto global
// self.PromptFlow. Estos strings DEBEN coincidir con lib/messages.js.
(function () {
  const PF = (self.PromptFlow = self.PromptFlow || {});

  PF.MSG = Object.freeze({
    ENHANCE: 'ENHANCE',
    GET_PROMPTS: 'GET_PROMPTS'
  });

  PF.ERR = Object.freeze({
    NO_KEY: 'NO_KEY',
    NO_PROVIDER: 'NO_PROVIDER',
    EMPTY_INPUT: 'EMPTY_INPUT',
    RATE_LIMIT: 'RATE_LIMIT',
    AUTH: 'AUTH',
    NETWORK: 'NETWORK',
    PROVIDER: 'PROVIDER'
  });

  // Registro de adaptadores por sitio (cada adaptador se auto-registra aquí).
  PF.adapters = PF.adapters || {};
})();
