import type { InteractiveConst } from '@psrt/sdk'

export type InteractiveSegment =
  | { kind: 'text'; text: string }
  | { kind: 'interactive'; token: string; entry: InteractiveConst }

/**
 * Splits content into plain-text and interactive segments by matching `@token@`
 * against iConst keys. Longest tokens win on ties (prefix safety, like consts).
 */
export function tokenizeInteractive(
  content: string,
  iConst: Record<string, InteractiveConst> | undefined,
): InteractiveSegment[] {
  if (!content) return []
  if (!iConst || Object.keys(iConst).length === 0) return [{ kind: 'text', text: content }]
  const tokens = Object.keys(iConst).sort((a, b) => b.length - a.length)

  const segments: InteractiveSegment[] = []
  let rest = content
  while (rest.length > 0) {
    let at = -1
    let hit = ''
    for (const tok of tokens) {
      const idx = rest.indexOf(`@${tok}@`)
      if (idx >= 0 && (at < 0 || idx < at)) {
        at = idx
        hit = tok
      }
    }
    if (at < 0) {
      segments.push({ kind: 'text', text: rest })
      break
    }
    if (at > 0) segments.push({ kind: 'text', text: rest.slice(0, at) })
    segments.push({ kind: 'interactive', token: hit, entry: iConst[hit]! })
    rest = rest.slice(at + hit.length + 2)
  }
  return segments
}
