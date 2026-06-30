import { initPsrt } from '@psrt/sdk'

let bootPromise: Promise<void> | null = null

/**
 * Initializes the PSRT WASM runtime exactly once for the whole Storybook
 * session — mirrors the `initPsrt()` calls made in psrt.web's main.tsx
 * (Editor Bootstrap and Reader Bootstrap) before any document is parsed.
 */
export function ensurePsrtReady(): Promise<void> {
  if (!bootPromise) {
    bootPromise = initPsrt({ pathCommandsPerLine: 10 })
  }
  return bootPromise
}
