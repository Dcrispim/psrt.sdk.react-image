const OMIT_ZERO_KEYS = new Set([
  'height',
  'width',
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'borderWidth',
  'strokeWidth',
  'borderRadius',
  'letterSpacing',
  'wordSpacing',
  'lineHeight',
  'textIndent',
])

function isZeroLikeCSSValue(value: string): boolean {
  const s = value.trim().toLowerCase()
  if (s === '0' || s === '0%' || s === '0px' || s === '0em' || s === '0rem' || s === '0pt' || s === '0cqh') {
    return true
  }
  const n = Number.parseFloat(s)
  return !Number.isNaN(n) && n === 0
}

export function isPresentStyleValue(key: string, value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (OMIT_ZERO_KEYS.has(key)) return value !== 0
    return true
  }
  if (typeof value !== 'string') return false
  const s = value.trim()
  if (s === '' || s === 'null') return false
  if (OMIT_ZERO_KEYS.has(key) && isZeroLikeCSSValue(s)) return false
  return true
}
