import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(viteConfig) {
    // @psrt/sdk's browser build inlines the ~23 MB WASM blob, so make sure a
    // single copy is used and don't pre-bundle it (avoids re-initializing WASM).
    viteConfig.resolve = viteConfig.resolve ?? {}
    viteConfig.resolve.dedupe = [...(viteConfig.resolve.dedupe ?? []), '@psrt/sdk']
    viteConfig.optimizeDeps = viteConfig.optimizeDeps ?? {}
    viteConfig.optimizeDeps.exclude = [
      ...(viteConfig.optimizeDeps.exclude ?? []),
      '@psrt/sdk',
    ]
    return viteConfig
  },
}

export default config
