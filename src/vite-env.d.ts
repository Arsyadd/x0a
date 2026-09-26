/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Dynamic environment ID — https://console.dynamic.xyz/dashboard/developer/api */
  readonly VITE_DYNAMIC_ENVIRONMENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
