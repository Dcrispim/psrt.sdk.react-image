import { Fragment, useMemo } from 'react'
import type { InteractiveConst } from '@psrt/sdk'
import { useInteractiveRegistry, type InteractiveRegistry } from '../interactive/context.js'
import { constsWithInteractive, expandConsts } from '../text/expandConsts.js'
import { renderInlineHTML } from '../text/inlineMarkup.js'
import { tokenizeInteractive, type InteractiveSegment } from '../text/tokenizeInteractive.js'

interface FormattedTextProps {
  content: string
  consts?: Record<string, string>
  iConst?: Record<string, InteractiveConst>
  /** When false, interactive consts render as plain render text (e.g. the stroke layer). */
  interactive?: boolean
  className?: string
}

function htmlSpan(text: string, key?: number) {
  return <span key={key} dangerouslySetInnerHTML={{ __html: renderInlineHTML(text) }} />
}

function renderSegment(seg: InteractiveSegment, registry: InteractiveRegistry, key: number) {
  if (seg.kind === 'text') return htmlSpan(seg.text, key)
  const handler = registry.get(seg.entry.type)
  if (!handler) return <Fragment key={key}>{seg.entry.render}</Fragment>
  return (
    <Fragment key={key}>
      {handler.render({ token: seg.token, render: seg.entry.render, value: seg.entry.value, entry: seg.entry })}
    </Fragment>
  )
}

export function FormattedText({ content, consts, iConst, interactive = true, className }: FormattedTextProps) {
  const registry = useInteractiveRegistry()

  // Non-interactive path (stroke layer / snapshots): collapse tokens to render text.
  const plainHtml = useMemo(() => {
    if (interactive) return null
    const merged = constsWithInteractive(consts, iConst)
    return renderInlineHTML(expandConsts(content, merged))
  }, [interactive, content, consts, iConst])

  const segments = useMemo(() => {
    if (!interactive) return null
    return tokenizeInteractive(expandConsts(content, consts), iConst)
  }, [interactive, content, consts, iConst])

  if (plainHtml != null) {
    return <span className={className} dangerouslySetInnerHTML={{ __html: plainHtml }} />
  }
  const segs = segments ?? []
  if (segs.every((s) => s.kind === 'text')) {
    const html = segs.map((s) => renderInlineHTML(s.kind === 'text' ? s.text : '')).join('')
    return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
  }
  return <span className={className}>{segs.map((s, i) => renderSegment(s, registry, i))}</span>
}
