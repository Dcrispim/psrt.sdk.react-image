import { useMemo } from 'react'
import { expandConsts } from '../text/expandConsts.js'
import { renderInlineHTML } from '../text/inlineMarkup.js'

interface FormattedTextProps {
  content: string
  consts?: Record<string, string>
  className?: string
}

export function FormattedText({ content, consts, className }: FormattedTextProps) {
  const html = useMemo(() => {
    const expanded = expandConsts(content, consts)
    return renderInlineHTML(expanded)
  }, [content, consts])
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
