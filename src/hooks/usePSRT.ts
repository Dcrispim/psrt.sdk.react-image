import { useEffect, useMemo, useState } from 'react'
import {
  createAssetRegistry,
  hydrateSourcesFromDocument,
  parse,
  resolveDocument,
  type AssetRegistry,
  type PsrtDocument,
} from '@psrt/sdk'

export interface UsePSRTOptions {
  registry?: AssetRegistry
}

export function usePSRT(
  source: string | null | undefined,
  options?: UsePSRTOptions,
): {
  document: PsrtDocument | null
  registry: AssetRegistry
  loading: boolean
  error: Error | null
} {
  const [document, setDocument] = useState<PsrtDocument | null>(null)
  const [registry, setRegistry] = useState<AssetRegistry>(
    () => options?.registry ?? createAssetRegistry(),
  )
  const [loading, setLoading] = useState(Boolean(source))
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!source) {
      setDocument(null)
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const parsed = parse(source)
      const reg = options?.registry ?? createAssetRegistry()
      const { document: hydrated } = hydrateSourcesFromDocument(parsed, reg)
      const resolved = resolveDocument(hydrated)
      setRegistry(reg)
      setDocument(resolved)
    } catch (e) {
      setDocument(null)
      setError(e instanceof Error ? e : new Error(String(e)))
    } finally {
      setLoading(false)
    }
  }, [source, options?.registry])

  const stableRegistry = useMemo(() => registry, [registry])

  return { document, registry: stableRegistry, loading, error }
}
