import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { defaultHandlers } from './defaultHandlers.js'
import type { InteractiveHandler } from './types.js'

export type InteractiveRegistry = Map<string, InteractiveHandler>

function buildRegistry(handlers: InteractiveHandler[]): InteractiveRegistry {
  const map: InteractiveRegistry = new Map()
  for (const h of defaultHandlers) map.set(h.type, h)
  for (const h of handlers) map.set(h.type, h) // user handlers override built-ins
  return map
}

// Default value already carries the built-in handlers, so link/desc work without a provider.
const InteractiveContext = createContext<InteractiveRegistry>(buildRegistry([]))

/**
 * Provides the interactive-const handler registry, decoupled from PSRTImage.
 * Pass extra/override handlers to support new `@type:` directives without touching
 * the core or SDK. Omitting the provider falls back to the built-in link/desc.
 */
export function PsrtInteractiveProvider({
  handlers = [],
  children,
}: {
  handlers?: InteractiveHandler[]
  children: ReactNode
}) {
  const registry = useMemo(() => buildRegistry(handlers), [handlers])
  return <InteractiveContext.Provider value={registry}>{children}</InteractiveContext.Provider>
}

export function useInteractiveRegistry(): InteractiveRegistry {
  return useContext(InteractiveContext)
}
