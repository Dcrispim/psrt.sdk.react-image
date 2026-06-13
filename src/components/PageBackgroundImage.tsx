import { forwardRef, useEffect, useState, type ImgHTMLAttributes, type SyntheticEvent } from 'react'
import { DEFAULT_FALLBACK_IMAGE } from '../document/constants.js'

type PageBackgroundImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackImage?: string
}

export const PageBackgroundImage = forwardRef<HTMLImageElement, PageBackgroundImageProps>(
  function PageBackgroundImage({ src, fallbackImage = DEFAULT_FALLBACK_IMAGE, onError, ...props }, ref) {
    const [failed, setFailed] = useState(false)

    useEffect(() => {
      setFailed(false)
    }, [src])

    const displaySrc = src && !failed ? src : fallbackImage

    const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
      if (src && !failed) setFailed(true)
      onError?.(e)
    }

    return <img ref={ref} src={displaySrc} onError={handleError} {...props} />
  },
)
