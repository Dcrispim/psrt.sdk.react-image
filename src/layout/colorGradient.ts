/** True for CSS gradient function values (e.g. `linear-gradient(...)`). */
export function isGradientValue(value: unknown): value is string {
  return typeof value === 'string' && /^\s*(?:repeating-)?linear-gradient\(/i.test(value)
}

export interface ParsedGradient {
  direction: string
  start: string
  end: string
}

/** Parses `linear-gradient(<direction>, <start>, <end>)` — the shape the psrt.web editor writes. */
export function parseLinearGradient(value: string): ParsedGradient | null {
  const m = value.trim().match(/^linear-gradient\(\s*([^,]+?)\s*,\s*(.+?)\s*,\s*(.+?)\s*\)$/i)
  if (!m) return null
  return { direction: m[1], start: m[2], end: m[3] }
}

/** objectBoundingBox x1/y1/x2/y2 (0..1) for the CSS keyword directions the editor offers. */
const DIRECTION_COORDS: Record<string, { x1: number; y1: number; x2: number; y2: number }> = {
  'to right': { x1: 0, y1: 0, x2: 1, y2: 0 },
  'to left': { x1: 1, y1: 0, x2: 0, y2: 0 },
  'to bottom': { x1: 0, y1: 0, x2: 0, y2: 1 },
  'to top': { x1: 0, y1: 1, x2: 0, y2: 0 },
  'to bottom right': { x1: 0, y1: 0, x2: 1, y2: 1 },
  'to bottom left': { x1: 1, y1: 0, x2: 0, y2: 1 },
  'to top right': { x1: 0, y1: 1, x2: 1, y2: 0 },
  'to top left': { x1: 1, y1: 1, x2: 0, y2: 0 },
}

export function gradientDirectionToSvgCoords(direction: string): { x1: number; y1: number; x2: number; y2: number } {
  return DIRECTION_COORDS[direction.trim().toLowerCase()] ?? DIRECTION_COORDS['to right']
}
