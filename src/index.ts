import './psrt-image.css'

export { PSRTImage, type PSRTImageProps } from './components/PSRTImage.js'
export { usePsrtDocument } from './hooks/usePsrtDocument.js'
export { usePSRT, type UsePSRTOptions } from './hooks/usePSRT.js'
export { usePageStyles } from './hooks/usePageStyles.js'
export { resolveEntryStyle } from './layout/resolveLayout.js'
export { estimateTextBoxHeightPct } from './layout/geometry.js'
export { DEFAULT_FALLBACK_IMAGE } from './document/constants.js'
export { pageToEntries, findPage } from './document/utils.js'
export {
  PsrtInteractiveProvider,
  useInteractiveRegistry,
  type InteractiveRegistry,
} from './interactive/context.js'
export { defaultHandlers } from './interactive/defaultHandlers.js'
export type { InteractiveHandler, InteractiveRenderArgs } from './interactive/types.js'
export type { AdaptedWebStyles } from './layout/styleAdapter.js'
export type {
  Document,
  InteractiveConst,
  Page,
  PsrtDocument,
  PsrtPage,
  PsrtText,
  TextBlock,
  RenderEntry,
  InteractionBlockRenderProps,
} from './types.js'
