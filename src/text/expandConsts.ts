import type { InteractiveConst } from '@psrt/sdk'

/** Flattens interactive consts to their render text, merged over plain consts. */
export function constsWithInteractive(
  consts: Record<string, string> | undefined,
  iConst: Record<string, InteractiveConst> | undefined,
): Record<string, string> | undefined {
  if (!iConst || Object.keys(iConst).length === 0) return consts
  const merged: Record<string, string> = { ...consts }
  for (const [token, ic] of Object.entries(iConst)) merged[token] = ic.render
  return merged
}

/** Mirrors psrt.ExpandConsts — longer keys first to avoid prefix clashes. */
export function expandConsts(
  content: string,
  consts: Record<string, string> | undefined,
): string {
  if (!consts || !content) return content
  const keys = Object.keys(consts).sort((a, b) => {
    if (b.length !== a.length) return b.length - a.length
    return a.localeCompare(b)
  })
  let out = content
  for (const k of keys) {
    out = out.split(`@${k}@`).join(consts[k])
  }
  return out
}
