import React from 'react'
import ReactDOMServer from 'react-dom/server'
import type { CSSProperties } from 'react'
import { textBlockWidthPx, textFontSizePx } from './geometry.js'
import { isPresentStyleValue } from '../style/styleValue.js'
import { parseStyle } from '../style/parseStyle.js'
import type { RenderEntry } from '../types.js'

export interface ImageReferenceMetrics {
  refWidth: number
  refHeight: number
  zoom: number
}

const SpechBaloonSvg: React.FC<{
  w: number
  stroke: number
  h: number
  color: string
  borderColor: string
}> = ({ w, stroke, h, color, borderColor }) => {
  const strokeMax = Math.min(stroke, w * 0.4, h * 0.4)
  return React.createElement(
    'svg',
    {
      width: w.toString(),
      height: h.toString(),
      viewBox: `0 0 ${w} ${h}`,
      xmlns: 'http://www.w3.org/1999/xhtml',
      fill: 'blue',
    },
    React.createElement('ellipse', {
      cx: w / 2,
      cy: h / 2,
      rx: w / 2 - strokeMax / 2,
      ry: h / 2 - strokeMax / 2,
      fill: 'none',
      stroke: borderColor,
      strokeWidth: strokeMax,
    }),
    stroke > 0
      ? React.createElement('polygon', {
          points: `${0},${h} ${w * 0.33 - Math.min(strokeMax * 4, w * 0.1)},${h - h * 0.4} ${Math.min(w * 0.62 + strokeMax * 4, w * 0.8)},${h - h * 0.4}`,
          fill: borderColor,
        })
      : null,
    React.createElement('polygon', {
      points: `${0},${h} ${w * 0.8},${h - h * 0.5} ${w * 0.4},${h / 2}`,
      fill: color,
    }),
    React.createElement('ellipse', {
      cx: w / 2,
      cy: h / 2,
      rx: w / 2 - strokeMax / 2,
      ry: h / 2 - strokeMax / 2,
      fill: color,
    }),
  )
}

function svgToDataUrl(svg: React.ReactElement): string {
  const svgString = ReactDOMServer.renderToStaticMarkup(svg)
  return `data:image/svg+xml,${encodeURIComponent(svgString)}`
}

export function applyBalloonIfNeeded(
  entry: RenderEntry,
  container: CSSProperties,
  metrics: ImageReferenceMetrics,
): CSSProperties {
  const style = parseStyle(entry.styleRaw) as CSSProperties & { balloon?: string }
  if (!style?.balloon || style.balloon === 'none') return container

  const { refWidth, refHeight, zoom } = metrics
  const fontPx = textFontSizePx(entry.size, refWidth, refHeight, zoom)
  const blockWidthPx =
    refWidth > 0 ? Math.round(textBlockWidthPx(entry.width, refWidth) * zoom) : 0

  if (style.balloon !== 'default' || fontPx <= 0) return container

  const balloonH = isPresentStyleValue('height', style.height)
    ? (Number(style.height) / 100) * refHeight * zoom
    : blockWidthPx

  const svgDataUrl = svgToDataUrl(
    React.createElement(SpechBaloonSvg, {
      stroke: Number.parseFloat(String(style.borderWidth ?? '0')),
      w: blockWidthPx,
      h: balloonH,
      color: String(style.backgroundColor ?? '#fff'),
      borderColor: String(style.borderColor ?? '#000'),
    }),
  )

  return {
    ...container,
    backgroundSize: 'cover',
    backgroundImage: `url(${svgDataUrl})`,
  }
}
