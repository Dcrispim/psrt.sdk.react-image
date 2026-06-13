export function textSizeBasisPx(canvasW: number, canvasH: number): number {
  const w = canvasW
  const h = canvasH
  if (w <= 0 && h <= 0) return 1
  if (w <= 0) return h
  if (h <= 0) return w
  return Math.min(w, h)
}

export function textFontSizePx(
  textSizePct: number,
  canvasW: number,
  canvasH: number,
  zoom = 1,
): number {
  const px = (textSizePct / 100) * textSizeBasisPx(canvasW, canvasH) * zoom
  return px < 1 ? 1 : px
}

export function textBlockWidthPx(widthPct: number, canvasW: number): number {
  const w = Math.round((canvasW * widthPct) / 100)
  return w < 1 ? 1 : w
}
