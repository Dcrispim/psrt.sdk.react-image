import { useMemo, type CSSProperties } from 'react'
import { adaptPathMaskWeb, type PsrtPathMask } from '@psrt/sdk'
import { usePageImageUrl } from '../hooks/usePageImageUrl.js'
import { gradientDirectionToSvgCoords, isGradientValue, parseLinearGradient } from '../layout/colorGradient.js'

function boxToCSS(box: Record<string, string>): CSSProperties {
  return box as CSSProperties
}

export function PathMaskBlock({
  pathMask,
  pageName,
  canvasW,
  canvasH,
  zoom,
  resolveAssetUrl,
  editorExtra,
}: {
  pathMask: PsrtPathMask
  pageName: string
  canvasW: number
  canvasH: number
  zoom: number
  resolveAssetUrl?: (url: string) => Promise<string>
  editorExtra?: CSSProperties
}) {
  const { box, path } = useMemo(
    () =>
      adaptPathMaskWeb({
        text: { x: pathMask.x, y: pathMask.y, width: pathMask.width, textSize: 0, style: pathMask.style, index: pathMask.index, content: '' },
        pathMask,
        canvasW,
        canvasH,
        zoom,
      }),
    [pathMask, canvasW, canvasH, zoom],
  )

  const { src: imageSrc } = usePageImageUrl(pathMask.imageRef, resolveAssetUrl, undefined)
  const clipId = `psrt-pathmask-${pageName}-${pathMask.index}-clip`
  const gradientId = `psrt-pathmask-${pageName}-${pathMask.index}-fill`

  // SVG `fill` não entende `linear-gradient(...)` — precisa de um <linearGradient>
  // com id referenciado via `url(#...)`. O styleadapter do psrt.core só repassa o
  // valor cru de "background", então o parse acontece aqui.
  const fillGradient = isGradientValue(path.fill) ? parseLinearGradient(path.fill) : null
  const fill = fillGradient ? `url(#${gradientId})` : (path.fill ?? 'transparent')

  return (
    <div
      className="psrt-mask-block psrt-path-mask-block"
      style={{ ...boxToCSS(box), ...editorExtra, pointerEvents: 'none' }}
    >
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <clipPath id={clipId}>
            <path d={pathMask.path} />
          </clipPath>
          {fillGradient ? (
            <linearGradient id={gradientId} {...gradientDirectionToSvgCoords(fillGradient.direction)}>
              <stop offset="0%" stopColor={fillGradient.start} />
              <stop offset="100%" stopColor={fillGradient.end} />
            </linearGradient>
          ) : null}
        </defs>
        <path d={pathMask.path} fill={fill} stroke={path.stroke} strokeWidth={path.strokeWidth} />
        {imageSrc ? (
          <image
            href={imageSrc}
            x={0}
            y={0}
            width={100}
            height={100}
            clipPath={`url(#${clipId})`}
            preserveAspectRatio="xMidYMid slice"
          />
        ) : null}
      </svg>
    </div>
  )
}
