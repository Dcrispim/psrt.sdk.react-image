import type { CSSProperties } from 'react'
import { adaptEntriesForWeb as sdkAdapt, type WebPreviewStyle } from '@psrt/sdk'
import { isPresentStyleValue } from '../style/styleValue.js'
import type { RenderEntry } from '../types.js'

export type AdaptedWebStyles = {
  container: CSSProperties
  text: CSSProperties
  hasStroke: boolean
  merged?: CSSProperties
}

function mapToCSSProperties(m: Record<string, string> | undefined): CSSProperties {
  if (!m) return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(m)) {
    if (v !== '' && isPresentStyleValue(k, v)) out[k] = v
  }
  return out as CSSProperties
}

export function adaptedToCSS(adapted: WebPreviewStyle): AdaptedWebStyles {
  return {
    container: mapToCSSProperties(adapted.container),
    text: mapToCSSProperties(adapted.text),
    hasStroke: adapted.hasStroke,
  }
}

type WebEntryInput = {
  index: number
  style: string
  content: string
  x: number
  y: number
  width: number
  textSize: number
  height?: number
  isMask?: boolean
}

function entriesToAdaptInput(entries: RenderEntry[]): WebEntryInput[] {
  return entries.map((e) => {
    const isMask = e.maskHeight !== undefined && e.maskHeight > 0
    return {
      index: e.index,
      style: e.styleRaw,
      content: e.text,
      x: e.x,
      y: e.y,
      width: e.width,
      textSize: e.size,
      height: isMask ? e.maskHeight : undefined,
      isMask,
    }
  })
}

export async function adaptEntriesForWeb(
  entries: RenderEntry[],
  canvasW: number,
  canvasH: number,
  zoom: number,
): Promise<Map<number, AdaptedWebStyles>> {
  const map = new Map<number, AdaptedWebStyles>()
  if (entries.length === 0 || canvasW < 1 || canvasH < 1) return map

  const inputs = entriesToAdaptInput(entries)
  const raw = sdkAdapt(JSON.stringify(inputs), canvasW, canvasH, zoom)
  if (!Array.isArray(raw)) return map

  raw.forEach((r, i) => {
    const idx = inputs[i]?.index ?? i
    map.set(idx, adaptedToCSS(r))
  })
  return map
}
