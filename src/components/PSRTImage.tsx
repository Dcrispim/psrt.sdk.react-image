import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { resolveDocument } from '@psrt/sdk'
import { DEFAULT_FALLBACK_IMAGE } from '../document/constants.js'
import { findPage, pageBackgroundColor, pageToEntries } from '../document/utils.js'
import { usePageImageUrl } from '../hooks/usePageImageUrl.js'
import { usePageStyles } from '../hooks/usePageStyles.js'
import { applyBalloonIfNeeded } from '../layout/balloon.js'
import { resolveEntryStyle } from '../layout/resolveLayout.js'
import type { PSRTImageProps, RenderEntry } from '../types.js'
import { PageBackgroundImage } from './PageBackgroundImage.js'
import { TextBlock } from './TextBlock.js'

function isMaskEntry(entry: RenderEntry): boolean {
  return entry.maskHeight != null && entry.maskHeight >= 0.5
}

export function PSRTImage({
  psrt,
  pageName,
  scale = 1,
  applyEditorStyles,
  enableEditor = false,
  fallbackImage = DEFAULT_FALLBACK_IMAGE,
  resolveAssetUrl,
  getBlockContent,
  showTexts = true,
  fixedReferenceSize = false,
  className,
  consts: constsProp,
  onImageSize,
  onSelectBlock,
  imageContainerRef,
  renderInteractionBlock,
  interactionOverlayRef,
  onInteractionOverlayPointerDown,
}: PSRTImageProps) {
  const imageRef = useRef<HTMLImageElement>(null)
  const [refSize, setRefSize] = useState<{ w: number; h: number } | null>(null)

  const resolvedDoc = useMemo(() => resolveDocument(psrt), [psrt])
  const docConsts = constsProp ?? resolvedDoc.consts
  const page = useMemo(() => findPage(resolvedDoc, pageName), [resolvedDoc, pageName])

  const entries = useMemo(
    () => (page ? pageToEntries(page, getBlockContent) : []),
    [page, getBlockContent],
  )

  const { src: imageSrc, loading: imageLoading } = usePageImageUrl(
    page?.imageUrl,
    resolveAssetUrl,
    fallbackImage,
  )

  useEffect(() => {
    setRefSize(null)
  }, [page?.imageUrl, imageSrc])

  const syncRefSize = () => {
    const img = imageRef.current
    if (!img?.naturalWidth || !img.naturalHeight) return
    const size = { w: img.naturalWidth, h: img.naturalHeight }
    setRefSize(size)
    onImageSize?.(size)
  }

  useEffect(() => {
    const img = imageRef.current
    if (img?.complete && img.naturalWidth > 0) syncRefSize()
  }, [imageSrc])

  const metrics =
    refSize && fixedReferenceSize
      ? { refWidth: refSize.w, refHeight: refSize.h, zoom: scale }
      : refSize
        ? { refWidth: refSize.w, refHeight: refSize.h, zoom: 1 }
        : undefined

  const adaptedByIndex = usePageStyles(
    entries,
    metrics?.refWidth ?? 0,
    metrics?.refHeight ?? 0,
    metrics?.zoom ?? scale,
  )

  const hasInteractionOverlay = Boolean(renderInteractionBlock)
  const clickable = !hasInteractionOverlay && (enableEditor || Boolean(onSelectBlock))

  if (!page) {
    return <div className={`psrt-image-root psrt-image-root--empty ${className ?? ''}`.trim()}>Page not found</div>
  }

  if (imageLoading && !imageSrc) {
    return <div className={`psrt-image-root psrt-image-root--loading ${className ?? ''}`.trim()}>Loading image…</div>
  }

  const bgColor = pageBackgroundColor(page)
  const containerStyle: CSSProperties | undefined = (() => {
    const bgStyle: CSSProperties = bgColor ? { backgroundColor: bgColor } : {}
    if (fixedReferenceSize && refSize) {
      return {
        ...bgStyle,
        width: refSize.w * scale,
        height: refSize.h * scale,
        flexShrink: 0,
      }
    }
    return Object.keys(bgStyle).length > 0 ? bgStyle : undefined
  })()

  const isCanvasSized = fixedReferenceSize && refSize !== null
  const containerClass = [
    'psrt-image-container',
    fixedReferenceSize ? 'psrt-image-container--fixed-ref' : '',
    fixedReferenceSize && (isCanvasSized ? 'psrt-image-container--sized' : 'psrt-image-container--sizing'),
  ]
    .filter(Boolean)
    .join(' ')

  const showEntries =
    showTexts && (fixedReferenceSize ? refSize !== null : true)

  const resolveStyles = (entry: RenderEntry) => {
    const resolved = resolveEntryStyle(entry, adaptedByIndex.get(entry.index), metrics)
    let container = resolved.container
    if (metrics) {
      container = applyBalloonIfNeeded(entry, container, metrics)
    }
    const editorExtra = applyEditorStyles?.(entry.index) ?? {}
    return {
      container: { ...container, ...editorExtra },
      text: resolved.text,
      hasStroke: resolved.hasStroke,
      hitArea: resolved.hitArea,
    }
  }

  const rootClass = ['psrt-image-root', className].filter(Boolean).join(' ')

  return (
    <div className={rootClass}>
      <div ref={imageContainerRef} className={containerClass} style={containerStyle}>
        <div className="psrt-image-frame">
          <PageBackgroundImage
            ref={imageRef}
            className="psrt-page-image"
            src={imageSrc}
            fallbackImage={fallbackImage}
            alt={pageName}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            onLoad={syncRefSize}
          />
        </div>
        {showEntries ? (
          <div
            className={[
              'psrt-entries-overlay',
              hasInteractionOverlay ? 'psrt-entries-overlay--visual-only' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {entries.map((entry) => {
              if (isMaskEntry(entry)) {
                const { container } = resolveStyles(entry)
                return (
                  <div
                    key={`mask-${entry.index}`}
                    className="psrt-mask-block"
                    style={{
                      ...container,
                      pointerEvents: 'none',
                    }}
                  />
                )
              }

              const { container, text } = resolveStyles(entry)
              return (
                <TextBlock
                  key={`block-${entry.index}`}
                  containerStyle={{
                    ...container,
                    cursor: clickable ? 'pointer' : undefined,
                    pointerEvents: clickable ? 'auto' : 'none',
                  }}
                  textStyle={text}
                  content={entry.text}
                  consts={docConsts}
                  onClick={() => onSelectBlock?.(entry.index)}
                />
              )
            })}
            {entries.map((entry) => {
              if (isMaskEntry(entry)) return null
              const { container, text, hasStroke } = resolveStyles(entry)
              if (!hasStroke) return null
              return (
                <TextBlock
                  key={`stroke-${entry.index}`}
                  containerStyle={{
                    ...container,
                    pointerEvents: 'none',
                    textShadow: 'none',
                    backgroundColor: 'transparent',
                  }}
                  textStyle={{
                    fontSize: text.fontSize,
                    WebkitTextStrokeWidth: text.WebkitTextStrokeWidth,
                    WebkitTextStrokeColor: text.WebkitTextStrokeColor,
                    WebkitTextStroke: text.WebkitTextStroke,
                    color: 'transparent',
                  }}
                  content={entry.text}
                  consts={docConsts}
                />
              )
            })}
          </div>
        ) : null}
        {hasInteractionOverlay && showEntries ? (
          <div
            ref={interactionOverlayRef}
            className="psrt-interaction-overlay"
            onPointerDown={onInteractionOverlayPointerDown}
          >
            {entries.map((entry) =>
              renderInteractionBlock?.({
                entry,
                adaptedStyles: adaptedByIndex.get(entry.index),
                imageWidth: refSize?.w ?? 0,
                imageHeight: refSize?.h ?? 0,
                zoom: metrics?.zoom ?? scale,
              }),
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export type { PSRTImageProps }
