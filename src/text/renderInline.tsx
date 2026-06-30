import { Fragment, createElement, type ReactNode } from 'react'
import type { InteractiveConst } from '@psrt/sdk'
import { DELIMS } from './inlineMarkup.js'

/** Renders one interactive entry to a node; the caller wires it to the handler registry. */
export type RenderInteractive = (token: string, entry: InteractiveConst) => ReactNode

interface Ctx {
  iConst: Record<string, InteractiveConst>
  tokens: string[]
  renderInteractive: RenderInteractive
}

function keyed(nodes: ReactNode[]): ReactNode[] {
  return nodes.map((n, i) => <Fragment key={i}>{n}</Fragment>)
}

function wrap(tags: string[], children: ReactNode[]): ReactNode {
  let node: ReactNode = keyed(children)
  for (let i = tags.length - 1; i >= 0; i--) node = createElement(tags[i], null, node)
  return node
}

function matchToken(s: string, i: number, ctx: Ctx): { token: string; end: number } | null {
  if (s[i] !== '@') return null
  for (const tok of ctx.tokens) {
    if (s.startsWith(`@${tok}@`, i)) return { token: tok, end: i + tok.length + 2 }
  }
  return null
}

// Single pass over a line: escapes, interactive tokens, and markup delimiters share
// one cursor, so markup (`**…**`) can wrap an interactive token without losing its pair.
function parseSegment(s: string, ctx: Ctx): ReactNode[] {
  const out: ReactNode[] = []
  let text = ''
  let i = 0
  const flush = () => {
    if (text) {
      out.push(text)
      text = ''
    }
  }
  while (i < s.length) {
    if (s[i] === '\\' && i + 1 < s.length) {
      text += s[i + 1]
      i += 2
      continue
    }
    const m = matchToken(s, i, ctx)
    if (m) {
      flush()
      out.push(ctx.renderInteractive(m.token, ctx.iConst[m.token]!))
      i = m.end
      continue
    }
    let matched = false
    for (const d of DELIMS) {
      if (!s.startsWith(d.open, i)) continue
      const innerStart = i + d.open.length
      const closeAt = s.indexOf(d.close, innerStart)
      if (closeAt <= innerStart) continue
      flush()
      out.push(wrap(d.tags, parseSegment(s.slice(innerStart, closeAt), ctx)))
      i = closeAt + d.close.length
      matched = true
      break
    }
    if (matched) continue
    text += s[i]
    i += 1
  }
  flush()
  return out
}

/** Inline markup + interactive tokens → React nodes. Mirrors renderInlineHTML, but
 *  interactive tokens become handler nodes instead of collapsing to text. */
export function renderInline(
  content: string,
  iConst: Record<string, InteractiveConst> | undefined,
  renderInteractive: RenderInteractive,
): ReactNode {
  if (!content) return null
  const tokens = iConst ? Object.keys(iConst).sort((a, b) => b.length - a.length) : []
  const ctx: Ctx = { iConst: iConst ?? {}, tokens, renderInteractive }
  return content.split('\n').map((line, li) => (
    <Fragment key={li}>
      {li > 0 ? <br /> : null}
      {keyed(parseSegment(line, ctx))}
    </Fragment>
  ))
}
