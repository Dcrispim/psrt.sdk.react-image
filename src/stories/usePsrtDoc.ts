import { useEffect, useState } from 'react'
import { parse, convertLegacyDocument, type PsrtDocument } from '@psrt/sdk'

/**
 * Parses PSRT for the stories, transparently accepting the legacy `-` coordinate
 * format (e.g. the example `.psrt` files in this repo). The current format uses
 * `,` separators; legacy docs must go through `convertLegacyDocument` first.
 */
export function usePsrtDoc(source: string | null | undefined): {
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
      let doc: PsrtDocument
      try {
        doc = parse(source)
      } catch (modernErr) {
        // Retry as legacy (`-` coords); rethrow the original error if that fails too.
        try {
          doc = parse(convertLegacyDocument(source))
        } catch {
          throw modernErr
        }
      }
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
