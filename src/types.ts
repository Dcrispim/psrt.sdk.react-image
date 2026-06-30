import type { CSSProperties, PointerEvent, ReactNode, Ref } from 'react'
import type { AssetRegistry, InteractiveConst, PsrtDocument, PsrtPathMask } from '@psrt/sdk'
import type { AdaptedWebStyles } from './layout/styleAdapter.js'

export type { Document, InteractiveConst, Page, PsrtDocument, PsrtMask, PsrtPage, PsrtPathMask, PsrtStyle, PsrtText, TextBlock } from '@psrt/sdk'

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
  /** Alias for applyEditorStyles (editor selection overlays). */
  getEditorStyles?: (blockId: string | number) => CSSProperties
  enableEditor?: boolean
  fallbackImage?: string
  resolveAssetUrl?: (url: string) => Promise<string>
  /** Embedded assets from $SOURCE; used when resolveAssetUrl is not provided. */
  assetRegistry?: AssetRegistry
  getBlockContent?: (index: number, fallback: string) => string
  showTexts?: boolean
  fixedReferenceSize?: boolean
  className?: string
  consts?: Record<string, string>
  /** Interactive consts override; defaults to the document's iConst map. */
  iConst?: Record<string, InteractiveConst>
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
  /** Present only for `~~` path mask entries; carries the raw block for adaptPathMaskWeb. */
  pathMask?: PsrtPathMask
}
