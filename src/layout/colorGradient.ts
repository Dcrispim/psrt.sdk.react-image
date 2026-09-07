/** True for CSS gradient function values (e.g. `linear-gradient(...)`). */
export function isGradientValue(value: unknown): value is string {
  return typeof value === 'string' && /^\s*(?:repeating-)?linear-gradient\(/i.test(value)
}
