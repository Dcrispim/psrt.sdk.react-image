import { useEffect, useState } from 'react'
import { DEFAULT_FALLBACK_IMAGE } from '../document/constants.js'

function isDirectImageUrl(value: string): boolean {
  return (
    value.startsWith('data:') ||
    value.startsWith('blob:') ||
    /^https?:\/\//i.test(value)
  )
}

export function usePageImageUrl(
  imageUrl: string | undefined,
  resolveAssetUrl?: (url: string) => Promise<string>,
  fallbackImage = DEFAULT_FALLBACK_IMAGE,
): { src: string | undefined; loading: boolean } {
  const [src, setSrc] = useState<string | undefined>(() => {
    if (!imageUrl) return undefined
    if (isDirectImageUrl(imageUrl)) return imageUrl
    return undefined
  })
  const [loading, setLoading] = useState(
    Boolean(imageUrl && !isDirectImageUrl(imageUrl)),
  )

  useEffect(() => {
    if (!imageUrl) {
      setSrc(undefined)
      setLoading(false)
      return
    }

    if (isDirectImageUrl(imageUrl)) {
      setSrc(imageUrl)
      setLoading(false)
      return
    }

    if (!resolveAssetUrl) {
      setSrc(fallbackImage)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    void resolveAssetUrl(imageUrl)
      .then((uri) => {
        if (!cancelled) {
          setSrc(uri || fallbackImage)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSrc(fallbackImage)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [imageUrl, resolveAssetUrl, fallbackImage])

  return { src, loading }
}
