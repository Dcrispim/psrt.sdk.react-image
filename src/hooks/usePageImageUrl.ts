import { useEffect, useState } from 'react'
import { DEFAULT_FALLBACK_IMAGE } from '../document/constants.js'

function isDirectImageUrl(value: string): boolean {
  return (
    value.startsWith('data:') ||
    value.startsWith('blob:') ||
    /^https?:\/\//i.test(value)
  )
}

type LocalImageValue = string | Blob | File

function normalizeStoredImage(result: unknown): LocalImageValue | null {
  if (result == null) return null
  if (typeof result === 'string' || result instanceof Blob) return result

  if (typeof result === 'object' && 'data' in result) {
    const data = (result as { data?: unknown }).data
    if (typeof data === 'string') return data
  }

  return null
}

function toLocalImageSrc(value: LocalImageValue): { src: string; objectUrl: string | null } {
  if (typeof value === 'string') {
    if (isDirectImageUrl(value)) {
      return { src: value, objectUrl: null }
    }
    return { src: `data:image/png;base64,${value}`, objectUrl: null }
  }

  const objectUrl = URL.createObjectURL(value)
  return { src: objectUrl, objectUrl }
}

function readFromStore(store: IDBObjectStore, key: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const getReq = store.get(key)
    getReq.onsuccess = () => resolve(getReq.result ?? null)
    getReq.onerror = () => reject(getReq.error)
  })
}

function encodeStorageKey(key: string): string {
  const trimmed = key.trim()
  if (!trimmed) return trimmed

  const bytes = new TextEncoder().encode(trimmed)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function lookupStorageKeys(logicalKey: string): string[] {
  const trimmed = logicalKey.trim()
  const encoded = encodeStorageKey(trimmed)
  const keys = [encoded]
  if (encoded !== trimmed) keys.push(trimmed)
  if (!trimmed.startsWith('source:')) keys.push(`source:${encoded}`, `source:${trimmed}`)
  return keys
}

function getImage(key: string): Promise<LocalImageValue | null> {
  if (typeof indexedDB === 'undefined') {
    return Promise.resolve(null)
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open('image-store', 1)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('sources')) {
        db.createObjectStore('sources')
      }
    }

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      void (async () => {
        try {
          const db = request.result
          const tx = db.transaction('sources', 'readonly')
          const store = tx.objectStore('sources')

          let result: unknown = null
          for (const storageKey of lookupStorageKeys(key)) {
            result = await readFromStore(store, storageKey)
            if (result != null) break
          }

          resolve(normalizeStoredImage(result))
        } catch (error) {
          reject(error)
        }
      })()
    }
  })
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

    setSrc(undefined)
    setLoading(true)

    let cancelled = false
    let objectUrl: string | null = null

    const run = async () => {
      if (imageUrl.startsWith('@local:')) {
        try {
          const key = imageUrl.slice(7)
          const stored = await getImage(key)

          if (cancelled) return

          if (!stored) {
            setSrc(fallbackImage)
            setLoading(false)
            return
          }

          const resolved = toLocalImageSrc(stored)
          objectUrl = resolved.objectUrl
          setSrc(resolved.src)
          setLoading(false)
        } catch {
          if (!cancelled) {
            setSrc(fallbackImage)
            setLoading(false)
          }
        }
        return
      }

      if (!resolveAssetUrl) {
        setSrc(fallbackImage)
        setLoading(false)
        return
      }

      try {
        const uri = await resolveAssetUrl(imageUrl)

        if (cancelled) return

        setSrc(uri || fallbackImage)
        setLoading(false)
      } catch {
        if (!cancelled) {
          setSrc(fallbackImage)
          setLoading(false)
        }
      }
    }

    void run()

    return () => {
      cancelled = true

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [imageUrl, resolveAssetUrl, fallbackImage])

  return { src, loading }
}
