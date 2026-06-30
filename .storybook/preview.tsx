import type { Preview } from '@storybook/react'
import { ensurePsrtReady } from '../src/stories/initPsrt.js'
import '../src/psrt-image.css'

const preview: Preview = {
  // Runs before every story renders; the promise is memoized so WASM boots once.
  loaders: [
    async () => {
      await ensurePsrtReady()
      return {}
    },
  ],
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#111111' },
        { name: 'light', value: '#ffffff' },
      ],
    },
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
  },
}

export default preview
