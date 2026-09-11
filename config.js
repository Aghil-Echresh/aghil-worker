const AGHIL_CONFIG = {

  appName: "Aghil Worker",

  version: "1.0.0",

  api: {
    enabled: false,

    workerUrl: "",

    endpoint: "/api/chat"
  },

  whatsapp: {
    enabled: false,

    phoneNumber: "",

    apiVersion: "v23.0",

    phoneNumberId: "",

    accessToken: ""
  },

  ai: {
    enabled: false,

    provider: "cloud",

    model: ""
  },

  memory: {
    enabled: true,

    storageKey: "aghil_worker_memory"
  }

};