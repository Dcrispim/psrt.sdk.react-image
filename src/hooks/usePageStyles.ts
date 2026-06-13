import { useEffect, useMemo, useState } from 'react'
import { adaptEntriesForWeb, type AdaptedWebStyles } from '../layout/styleAdapter.js'
import type { RenderEntry } from '../types.js'

export function usePageStyles(
  entries: RenderEntry[],
  canvasW: number,
  canvasH: number,
  zoom: number,
): Map<number, AdaptedWebStyles> {
  const [map, setMap] = useState<Map<number, AdaptedWebStyles>>(new Map())

  const entriesKey = useMemo(
    () =>
      JSON.stringify(
        entries.map((e) => ({
          i: e.index,
          x: e.x,
          y: e.y,
          w: e.width,
          s: e.size,
          h: e.maskHeight,
          t: e.text,
          styleRaw: e.styleRaw,
        })),
      ),
    [entries],
  )

  useEffect(() => {
    if (canvasW < 1 || canvasH < 1 || entries.length === 0) {
      setMap(new Map())
      return
    }
    let cancelled = false
    void adaptEntriesForWeb(entries, canvasW, canvasH, zoom).then((next) => {
      if (!cancelled) setMap(next)
    })
    return () => {
      cancelled = true
    }
  }, [entriesKey, canvasW, canvasH, zoom, entries.length])

  return map
}
