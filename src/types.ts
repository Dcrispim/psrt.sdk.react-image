import type { CSSProperties, PointerEvent, ReactNode, Ref } from 'react'
import type { PsrtDocument } from '@psrt/sdk'
import type { AdaptedWebStyles } from './layout/styleAdapter.js'

export type { Document, Page, PsrtDocument, PsrtMask, PsrtPage, PsrtStyle, PsrtText, TextBlock } from '@psrt/sdk'

export interface InteractionBlockRenderProps {
  entry: RenderEntry
  adaptedStyles: AdaptedWebStyles | undefined
  imageWidth: number
  imageHeight: number
  zoom: number
}

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
  consts?: Record<string, string>
  onImageSize?: (size: { w: number; h: number }) => void
  onSelectBlock?: (index: number) => void
  imageContainerRef?: Ref<HTMLDivElement>
  /** Canvas editor: render invisible hit targets on top of the visual layer. */
  renderInteractionBlock?: (props: InteractionBlockRenderProps) => ReactNode
  interactionOverlayRef?: Ref<HTMLDivElement>
  onInteractionOverlayPointerDown?: (e: PointerEvent<HTMLDivElement>) => void
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
