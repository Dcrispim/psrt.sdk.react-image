import { useEffect, useState } from 'react'
import { parse, type PsrtDocument } from '@psrt/sdk'

export function usePsrtDocument(source: string | null | undefined): {
  document: PsrtDocument | null
  loading: boolean
  error: Error | null
} {
  const [document, setDocument] = useState<PsrtDocument | null>(null)
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
      const doc = parse(source)
      setDocument(doc)
    } catch (e) {
      setDocument(null)
      setError(e instanceof Error ? e : new Error(String(e)))
    } finally {
      setLoading(false)
    }
  }, [source])

  return { document, loading, error }
}
