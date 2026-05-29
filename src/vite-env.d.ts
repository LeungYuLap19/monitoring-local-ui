/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_KEY?: string;
  readonly VITE_MONITOR_API_BASE_URL?: string;
  readonly VITE_TRPC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
