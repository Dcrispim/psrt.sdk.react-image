import type { Meta, StoryObj } from '@storybook/react'
import {
  LivePsrtImage,
  DEFAULT_IMAGE_URL,
  DEFAULT_BLOCK_STYLE,
  DEFAULT_CONSTS,
  DEFAULT_FONTS,
} from './LivePsrtImage.js'

/**
 * Live editor driven entirely by Storybook's native controls: the image URL, the
 * single text block (text/position/style), plus consts and fonts as key/value
 * lists. The wrapper turns those fields into a PsrtDocument.
 */
const meta: Meta<typeof LivePsrtImage> = {
  title: 'PSRT/LiveMode',
  component: LivePsrtImage,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    imageUrl: { name: 'URL da imagem', control: 'text' },
    pageStyle: { name: 'Estilo da página', control: 'object' },
    text: { name: 'Texto', control: 'text', description: 'Pode referenciar consts como @chave@' },
    x: { name: 'X %', control: { type: 'number', step: 0.5 } },
    y: { name: 'Y %', control: { type: 'number', step: 0.5 } },
    width: { name: 'Largura %', control: { type: 'number', step: 0.5 } },
    size: { name: 'Tamanho', control: { type: 'number', step: 0.5 } },
    blockStyle: { name: 'Estilo do bloco', control: 'object' },
    consts: {
      name: 'Consts (chave/valor)',
      control: 'object',
      description: 'Constantes do $CONSTS; use @chave@ no texto.',
    },
    fonts: {
      name: 'Fontes (família/URL)',
      control: 'object',
      description: 'Chave = font-family (usável no estilo); valor = URL do arquivo de fonte.',
    },
    showTexts: { name: 'Exibir legenda', control: 'boolean' },
  },
  args: {
    imageUrl: DEFAULT_IMAGE_URL,
    pageStyle: {},
    text: 'Olá, @nome@!',
    x: 8,
    y: 72,
    width: 84,
    size: 5,
    blockStyle: DEFAULT_BLOCK_STYLE,
    consts: DEFAULT_CONSTS,
    fonts: DEFAULT_FONTS,
    showTexts: true,
  },
}

export default meta

type Story = StoryObj<typeof LivePsrtImage>

export const LiveMode: Story = {}
