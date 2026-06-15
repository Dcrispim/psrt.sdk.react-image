import { useMemo, useRef } from 'react'
import { resolveDocument, type PsrtDocument, type PsrtPage } from '@psrt/sdk'

/** Key for resolveDocument — excludes block x/y and layout dimensions (overlay only). */
export function documentStructuralKey(doc: PsrtDocument): string {
  const pages = doc.pages.map((p) => ({
    n: p.name,
    u: p.imageUrl,
    st: p.style,
    t: (p.texts ?? []).map((t) => ({
      i: t.index,
      c: t.content,
      st: t.style,
      ir: t.imageRef,
    })),
    m: (p.masks ?? []).map((m) => ({
      i: m.index,
      st: m.style,
      ir: m.imageRef,
    })),
  }))
  return JSON.stringify({
    co: doc.consts,
    fn: doc.fonts,
    p: pages,
  })
}

function overlayPageLayout(resolved: PsrtPage, live: PsrtPage): PsrtPage {
  const liveTexts = new Map((live.texts ?? []).map((t) => [t.index, t]))
  const liveMasks = new Map((live.masks ?? []).map((m) => [m.index, m]))

  let texts = resolved.texts ?? []
  if (texts.length > 0) {
    texts = texts.map((rt) => {
      const lt = liveTexts.get(rt.index)
      if (!lt) return rt
      if (
        rt.x === lt.x &&
        rt.y === lt.y &&
        rt.width === lt.width &&
        rt.textSize === lt.textSize
      ) {
        return rt
      }
      return { ...rt, x: lt.x, y: lt.y, width: lt.width, textSize: lt.textSize }
    })
  }

  let masks = resolved.masks
  if (masks && masks.length > 0) {
    masks = masks.map((rm) => {
      const lm = liveMasks.get(rm.index)
      if (!lm) return rm
      if (
        rm.x === lm.x &&
        rm.y === lm.y &&
        rm.width === lm.width &&
        rm.height === lm.height
      ) {
        return rm
      }
      return { ...rm, x: lm.x, y: lm.y, width: lm.width, height: lm.height }
    })
  }

  if (texts === resolved.texts && masks === resolved.masks) return resolved
  return { ...resolved, texts, masks }
}

export function overlayBlockLayout(resolved: PsrtDocument, live: PsrtDocument): PsrtDocument {
  const liveByName = new Map(live.pages.map((p) => [p.name, p]))
  let changed = false
  const pages = resolved.pages.map((rp) => {
    const lp = liveByName.get(rp.name)
    if (!lp) return rp
    const next = overlayPageLayout(rp, lp)
    if (next !== rp) changed = true
    return next
  })
  if (!changed) return resolved
  return { ...resolved, pages }
}

export function useResolvedDocument(psrt: PsrtDocument): PsrtDocument {
  const cacheRef = useRef<{ key: string; resolved: PsrtDocument } | null>(null)

  return useMemo(() => {
    const key = documentStructuralKey(psrt)
    const cached = cacheRef.current
    if (cached?.key === key) {
      return overlayBlockLayout(cached.resolved, psrt)
    }
    const resolved = resolveDocument(psrt)
    cacheRef.current = { key, resolved }
    return overlayBlockLayout(resolved, psrt)
  }, [psrt])
}
