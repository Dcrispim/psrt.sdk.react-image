import type { PsrtDocument, PsrtPage, PsrtStyle } from '@psrt/sdk'
import type { RenderEntry } from '../types.js'

export function styleToRaw(style: PsrtStyle): string {
  if (typeof style === 'string') return style
  return JSON.stringify(style ?? {})
}

export function findPage(doc: PsrtDocument, pageName: string): PsrtPage | undefined {
  return doc.pages.find((p) => p.name === pageName)
}

export function pageToEntries(page: PsrtPage, getBlockContent?: (index: number, fallback: string) => string): RenderEntry[] {
  const entries: RenderEntry[] = []

  for (const t of page.texts ?? []) {
    entries.push({
      index: t.index,
      x: t.x,
      y: t.y,
      width: t.width,
      size: t.textSize,
      text: getBlockContent ? getBlockContent(t.index, t.content) : t.content,
      styleRaw: styleToRaw(t.style),
    })
  }

  for (const m of page.masks ?? []) {
    entries.push({
      index: m.index,
      x: m.x,
      y: m.y,
      width: m.width,
      size: 0,
      maskHeight: m.height,
      text: '',
      styleRaw: styleToRaw(m.style),
    })
  }

  for (const pm of page.pathMasks ?? []) {
    entries.push({
      index: pm.index,
      x: pm.x,
      y: pm.y,
      width: pm.width,
      size: 0,
      maskHeight: pm.height,
      text: '',
      styleRaw: styleToRaw(pm.style),
      pathMask: pm,
    })
  }

  entries.sort((a, b) => a.index - b.index)
  return entries
}

export function pageBackgroundColor(page: PsrtPage): string | undefined {
  const style = typeof page.style === 'object' && page.style !== null ? page.style : {}
  const bg =
    (style as Record<string, unknown>).background ??
    (style as Record<string, unknown>).backGround ??
    (style as Record<string, unknown>)['background-color']
  return typeof bg === 'string' && bg ? bg : undefined
}
