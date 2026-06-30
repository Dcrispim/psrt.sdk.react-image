import type { Meta, StoryObj } from '@storybook/react'
import { ReaderStory, EditorStory } from './PsrtImageStory.js'
import { introFirstPage } from './fixtures.js'

type StoryArgs = {
  /** Uploaded .psrt file (Storybook hands back object URLs). Empty = sample document. */
  psrtFile?: readonly string[]
  /** Selected page to render. */
  pageName: string
  showTexts: boolean
  scale: number
}

const meta: Meta<StoryArgs> = {
  title: 'PSRT/PSRTImage',
  argTypes: {
    psrtFile: {
      name: 'Arquivo .psrt',
      control: { type: 'file', accept: '.psrt,.txt,.json,text/plain' },
      description: 'Envie um .psrt para testar a página. Vazio usa o documento de exemplo.',
    },
    pageName: {
      name: 'Página selecionada',
      control: 'text',
      description: 'Nome da página a renderizar ($START <nome>). Também há um seletor no canvas.',
    },
    showTexts: { control: 'boolean', description: 'Exibir as legendas/blocos' },
    scale: {
      control: { type: 'range', min: 0.25, max: 2, step: 0.05 },
      description: 'Zoom (apenas no modo editor)',
    },
  },
  args: {
    pageName: introFirstPage,
    showTexts: true,
    scale: 1,
  },
}

export default meta

type Story = StoryObj<StoryArgs>

/** Mirrors the psrt.web Reader: scrollable page with toggleable captions. */
export const Reader: Story = {
  render: ({ psrtFile, pageName, showTexts }) => (
    <ReaderStory psrtFile={psrtFile} pageName={pageName} showTexts={showTexts} />
  ),
}

/** Mirrors the psrt.web Editor canvas: fixed reference size, zoom, selectable blocks. */
export const Editor: Story = {
  render: ({ psrtFile, pageName, showTexts, scale }) => (
    <EditorStory
      psrtFile={psrtFile}
      pageName={pageName}
      showTexts={showTexts}
      scale={scale}
    />
  ),
}
