import type { CSSProperties } from 'react'
import { pickExplicitAdapterCSS, isDeclaredInStyleRaw } from '../style/explicitWebStyles.js'
import { isPresentStyleValue } from '../style/styleValue.js'
import { estimateTextBoxHeightPct, textFontSizePx } from './geometry.js'
import { applyBackdropGlassFix } from './backdropGlass.js'
import type { AdaptedWebStyles } from './styleAdapter.js'
import type { RenderEntry } from '../types.js'

function adapterContainerCSS(container: CSSProperties | undefined): CSSProperties {
  if (!container) return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(container)) {
    if (typeof v !== 'string' && typeof v !== 'number') continue
    const s = String(v)
    if (s !== '' && isPresentStyleValue(k, s)) out[k] = s
  }
  return out as CSSProperties
}

const empty = (): AdaptedWebStyles => ({
  container: {},
  text: {},
  hasStroke: false,
})

export function resolveEntryStyle(
  entry: RenderEntry,
  adapted: AdaptedWebStyles | undefined,
  metrics: { refWidth: number; refHeight: number; zoom: number } | undefined,
): AdaptedWebStyles & { hitArea: CSSProperties } {
  const base = adapted ?? empty()
  const styleRaw = entry.styleRaw
  const isMask = entry.maskHeight != null && entry.maskHeight >= 0.5

  const boxStyle = isMask
    ? pickExplicitAdapterCSS(base.container, styleRaw)
    : adapterContainerCSS(base.container)
  const textStyle = pickExplicitAdapterCSS(base.text, styleRaw)

  const fontPx =
    metrics && metrics.refWidth > 0 && metrics.refHeight > 0
      ? textFontSizePx(entry.size, metrics.refWidth, metrics.refHeight, metrics.zoom)
      : 0

  const fontSize = isDeclaredInStyleRaw('fontSize', styleRaw)
    ? (textStyle.fontSize ?? boxStyle.fontSize)
    : fontPx > 0
      ? `${fontPx}px`
      : undefined

  const layout: CSSProperties = {
    position: 'absolute',
    left: `${entry.x}%`,
    top: `${entry.y}%`,
    width: `${entry.width}%`,
    boxSizing: 'border-box',
    zIndex: entry.index,
    ...(fontSize ? { fontSize } : {}),
    ...(isMask ? { height: `${entry.maskHeight}%` } : {}),
  }

  const rawH =
    typeof base.container?.height === 'string' ? base.container.height : undefined
  const adapterH =
    rawH && isPresentStyleValue('height', rawH) ? rawH : undefined
  let hitHeight: string | undefined
  if (isMask) {
    hitHeight = `${entry.maskHeight}%`
  } else if (adapterH) {
    hitHeight = adapterH
  } else if (
    typeof boxStyle.height === 'string' &&
    isPresentStyleValue('height', boxStyle.height)
  ) {
    hitHeight = boxStyle.height
  } else if (metrics && metrics.refHeight > 0) {
    hitHeight = estimateTextBoxHeightPct(entry, metrics)
  }

  const hitArea: CSSProperties = {
    position: 'absolute',
    left: `${entry.x}%`,
    top: `${entry.y}%`,
    width: `${entry.width}%`,
    boxSizing: 'border-box',
    zIndex: entry.index,
    height: hitHeight,
    minHeight: hitHeight,
  }

  return {
    container: applyBackdropGlassFix({ ...boxStyle, ...layout }),
    text: { ...textStyle, ...(fontSize ? { fontSize } : {}) },
    hasStroke: base.hasStroke,
    merged: { ...boxStyle, ...textStyle, ...layout },
    hitArea,
  }
}
