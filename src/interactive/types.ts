import type { ReactNode } from 'react'
import type { InteractiveConst } from '@psrt/sdk'

/** Data passed to a handler when rendering one interactive const occurrence. */
export interface InteractiveRenderArgs {
  /** Reference token `type:render` (the text inside `@…@`). */
  token: string
  /** Inline text to show in place. */
  render: string
  /** Handler payload (URL, modal content, …). */
  value: string
  /** Full entry, for handlers needing the raw type. */
  entry: InteractiveConst
}

/**
 * Agnostic contract for rendering an interactive const. A handler claims a `type`
 * (matching InteractiveConst.type) and returns the final JSX for each occurrence.
 * New directives are added by registering a handler — no core/SDK change needed.
 */
export interface InteractiveHandler {
  type: string
  render: (args: InteractiveRenderArgs) => ReactNode
}
