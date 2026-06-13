import type { CSSProperties, HTMLAttributes } from 'react'
import { FormattedText } from './FormattedText.js'

export function TextBlock({
  containerStyle,
  textStyle,
  content,
  consts,
  className = 'psrt-text-block',
  ...divProps
}: {
  containerStyle: CSSProperties
  textStyle: CSSProperties
  content: string
  consts?: Record<string, string>
  className?: string
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style' | 'children'>) {
  return (
    <div className={className} style={containerStyle} {...divProps}>
      <span className="psrt-text-block__content" style={textStyle}>
        <FormattedText content={content} consts={consts} />
      </span>
    </div>
  )
}
