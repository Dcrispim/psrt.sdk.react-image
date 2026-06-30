import { useMemo, type ReactNode } from 'react'
import type { InteractiveConst } from '@psrt/sdk'
import { useInteractiveRegistry } from '../interactive/context.js'
import { constsWithInteractive, expandConsts } from '../text/expandConsts.js'
import { renderInlineHTML } from '../text/inlineMarkup.js'
import { renderInline } from '../text/renderInline.js'

interface FormattedTextProps {
  content: string
  consts?: Record<string, string>
  iConst?: Record<string, InteractiveConst>
  /** When false, interactive consts render as plain render text (e.g. the stroke layer). */
  interactive?: boolean
  className?: string
}

export function FormattedText({ content, consts, iConst, interactive = true, className }: FormattedTextProps) {
  const registry = useInteractiveRegistry()

  // Non-interactive path (stroke layer / snapshots): collapse tokens to render text.
  const plainHtml = useMemo(() => {
    if (interactive) return null
    return renderInlineHTML(expandConsts(content, constsWithInteractive(consts, iConst)))
  }, [interactive, content, consts, iConst])

  const nodes = useMemo(() => {
    if (!interactive) return null
    const renderInteractive = (token: string, entry: InteractiveConst): ReactNode => {
      const handler = registry.get(entry.type)
      if (!handler) return entry.render
      return handler.render({ token, render: entry.render, value: entry.value, entry })
    }
    return renderInline(expandConsts(content, consts), iConst, renderInteractive)
  }, [interactive, content, consts, iConst, registry])

  if (plainHtml != null) {
    return <span className={className} dangerouslySetInnerHTML={{ __html: plainHtml }} />
  }
  return <span className={className}>{nodes}</span>
}
