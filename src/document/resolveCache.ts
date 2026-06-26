import { useRef } from 'react'
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
    pm: (p.pathMasks ?? []).map((pm) => ({
      i: pm.index,
      st: pm.style,
      ir: pm.imageRef,
      pa: pm.path,
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
  const livePathMasks = new Map((live.pathMasks ?? []).map((pm) => [pm.index, pm]))

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

  let pathMasks = resolved.pathMasks
  if (pathMasks && pathMasks.length > 0) {
    pathMasks = pathMasks.map((rpm) => {
      const lpm = livePathMasks.get(rpm.index)
      if (!lpm) return rpm
      if (
        rpm.x === lpm.x &&
        rpm.y === lpm.y &&
        rpm.width === lpm.width &&
        rpm.height === lpm.height
      ) {
        return rpm
      }
      return { ...rpm, x: lpm.x, y: lpm.y, width: lpm.width, height: lpm.height }
    })
  }

  const imageUrl = live.imageUrl ?? resolved.imageUrl
  if (
    imageUrl === resolved.imageUrl &&
    texts === resolved.texts &&
    masks === resolved.masks &&
    pathMasks === resolved.pathMasks
  ) {
    return resolved
  }
  return { ...resolved, imageUrl, texts, masks, pathMasks }
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
  const key = documentStructuralKey(psrt)
  const cached = cacheRef.current

  if (cached?.key === key) {
    return overlayBlockLayout(cached.resolved, psrt)
  }

  const resolved = resolveDocument(psrt)
  cacheRef.current = { key, resolved }
  return overlayBlockLayout(resolved, psrt)
}
