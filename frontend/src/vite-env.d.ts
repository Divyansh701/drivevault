/// <reference types="vite/client" />

// Augment ImportMeta with Vite's env variables
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Add more env vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
