/** Mirrors psrt.RenderInlineHTML */

export type InlineDelim = { open: string; close: string; tags: string[] }

/** Shared markup table (outermost→innermost tags); used by both the HTML and React renderers. */
export const DELIMS: InlineDelim[] = [
  { open: '***', close: '***', tags: ['strong', 'em'] },
  { open: '**', close: '**', tags: ['strong'] },
  { open: '*', close: '*', tags: ['em'] },
  { open: '_', close: '_', tags: ['u'] },
  { open: '~', close: '~', tags: ['s'] },
]

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderSegment(s: string): string {
  let out = ''
  let i = 0
  while (i < s.length) {
    if (s[i] === '\\' && i + 1 < s.length) {
      out += escapeHtml(s[i + 1])
      i += 2
      continue
    }
    let matched = false
    for (const d of DELIMS) {
      if (!s.startsWith(d.open, i)) continue
      const innerStart = i + d.open.length
      const closeAt = s.indexOf(d.close, innerStart)
      if (closeAt <= innerStart) continue
      const open = d.tags.map((t) => `<${t}>`).join('')
      const close = d.tags.map((t) => `</${t}>`).reverse().join('')
      out += open + renderSegment(s.slice(innerStart, closeAt)) + close
      i = closeAt + d.close.length
      matched = true
      break
    }
    if (matched) continue
    out += escapeHtml(s[i])
    i += 1
  }
  return out
}

export function renderInlineHTML(content: string): string {
  if (!content) return ''
  return content.split('\n').map((line) => renderSegment(line)).join('<br/>')
}
