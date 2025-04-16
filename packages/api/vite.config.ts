// vite.config.ts

import { defineConfig } from "vite"
import { cloudflare } from "@cloudflare/vite-plugin"
import wasm from "vite-plugin-wasm"

export default defineConfig({
  plugins: [cloudflare(), wasm()],
})