import type { CSSProperties, Ref } from 'react'
import type { PsrtDocument } from '@psrt/sdk'

export type { Document, Page, PsrtDocument, PsrtMask, PsrtPage, PsrtStyle, PsrtText, TextBlock } from '@psrt/sdk'

export interface PSRTImageProps {
  psrt: PsrtDocument
  pageName: string
  scale?: number
  applyEditorStyles?: (blockId: string | number) => CSSProperties
  enableEditor?: boolean
  fallbackImage?: string
  resolveAssetUrl?: (url: string) => Promise<string>
  getBlockContent?: (index: number, fallback: string) => string
  showTexts?: boolean
  fixedReferenceSize?: boolean
  className?: string
  onImageSize?: (size: { w: number; h: number }) => void
  onSelectBlock?: (index: number) => void
  imageContainerRef?: Ref<HTMLDivElement>
}

export interface RenderEntry {
  index: number
  x: number
  y: number
  width: number
  size: number
  text: string
  styleRaw: string
  maskHeight?: number
}
