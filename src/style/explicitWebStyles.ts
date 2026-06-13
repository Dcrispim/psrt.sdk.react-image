import type { CSSProperties } from 'react'
import { parseStyle } from './parseStyle.js'
import { isPresentStyleValue } from './styleValue.js'

const ENTRY_LAYOUT_KEYS = new Set(['position', 'left', 'top', 'width'])
const FLEX_LAYOUT_KEYS = new Set(['display', 'flexDirection', 'justifyContent', 'alignItems'])
const SPAN_ALIGN_LAYOUT_KEYS = new Set(['display', 'width'])

const RAW_TO_ADAPTER_KEY: Record<string, string> = {
  background: 'backgroundColor',
  backGround: 'backgroundColor',
  'background-color': 'backgroundColor',
  'font-weight': 'fontWeight',
  fw: 'fontWeight',
  'text-align': 'textAlign',
  ta: 'textAlign',
  'font-size': 'fontSize',
  pd: 'padding',
  'border-width': 'borderWidth',
  bw: 'borderWidth',
  'border-color': 'borderColor',
  bc: 'borderColor',
  'border-radius': 'borderRadius',
  br: 'borderRadius',
  'text-shadow': 'textShadow',
  ts: 'textShadow',
  'box-shadow': 'boxShadow',
  bsh: 'boxShadow',
  'line-height': 'lineHeight',
  'letter-spacing': 'letterSpacing',
  'word-spacing': 'wordSpacing',
  'stroke-width': 'strokeWidth',
  sw: 'strokeWidth',
  'stroke-color': 'strokeColor',
  sc: 'strokeColor',
}

const BLUR_DERIVED_ADAPTER_KEYS = new Set([
  'backdropFilter',
  'WebkitBackdropFilter',
  'maskImage',
  'WebkitMaskImage',
  'maskSize',
  'WebkitMaskSize',
])

function toKebab(key: string): string {
  return key.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
}

export function isDeclaredInStyleRaw(cssKey: string, styleRaw: string): boolean {
  const raw = parseStyle(styleRaw)
  if (isPresentStyleValue(cssKey, raw[cssKey])) return true
  const kebab = toKebab(cssKey)
  if (isPresentStyleValue(kebab, raw[kebab])) return true
  for (const [rawKey, adapterKey] of Object.entries(RAW_TO_ADAPTER_KEY)) {
    if (adapterKey === cssKey && isPresentStyleValue(rawKey, raw[rawKey])) {
      return true
    }
  }
  return false
}

function hasAlignInStyleRaw(styleRaw: string): boolean {
  return isDeclaredInStyleRaw('textAlign', styleRaw) || isDeclaredInStyleRaw('alignItems', styleRaw)
}

function hasBlurInStyleRaw(styleRaw: string): boolean {
  if (isDeclaredInStyleRaw('blur', styleRaw)) return true
  for (const side of ['blurLeft', 'blurRight', 'blurTop', 'blurBottom']) {
    if (isDeclaredInStyleRaw(side, styleRaw)) return true
  }
  return false
}

export function pickExplicitAdapterCSS(props: CSSProperties, styleRaw: string): CSSProperties {
  const out: CSSProperties = {}
  const keepFlexLayout = hasAlignInStyleRaw(styleRaw)
  const keepBlurDerived = hasBlurInStyleRaw(styleRaw)
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === '') continue
    if (ENTRY_LAYOUT_KEYS.has(key)) continue
    if (keepFlexLayout && (FLEX_LAYOUT_KEYS.has(key) || SPAN_ALIGN_LAYOUT_KEYS.has(key))) {
      ;(out as Record<string, unknown>)[key] = value
      continue
    }
    if (keepBlurDerived && BLUR_DERIVED_ADAPTER_KEYS.has(key)) {
      ;(out as Record<string, unknown>)[key] = value
      continue
    }
    if (!isDeclaredInStyleRaw(key, styleRaw)) continue
    ;(out as Record<string, unknown>)[key] = value
  }
  return out
}
