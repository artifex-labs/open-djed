// vite.config.ts

import { defineConfig } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import wasm from 'vite-plugin-wasm'

export default defineConfig({
  plugins: [cloudflare(), wasm()],
  build: {
    target: 'esnext',
    sourcemap: true,
    minify: false,
  },
  resolve: {
    mainFields: ['browser', 'module', 'main'],
    alias: {
      '@anastasia-labs/cardano-multiplatform-lib-nodejs': '@anastasia-labs/cardano-multiplatform-lib-browser',
      '@lucid-evolution/uplc': '@lucid-evolution/uplc/dist/browser/uplc_tx.js',
      '@emurgo/cardano-message-signing-nodejs': '@emurgo/cardano-message-signing-browser',
    },
  },
})
