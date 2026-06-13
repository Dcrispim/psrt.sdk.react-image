import { useMemo } from 'react'
import { renderInlineHTML } from '../text/inlineMarkup.js'

interface FormattedTextProps {
  content: string
  className?: string
}

export function FormattedText({ content, className }: FormattedTextProps) {
  const html = useMemo(() => renderInlineHTML(content), [content])
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
