import { useEffect, useMemo, type CSSProperties } from 'react'
import { PSRTImage } from '../components/PSRTImage.js'
import { usePsrtDoc } from './usePsrtDoc.js'

const NOT_FOUND_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560">
       <rect width="100%" height="100%" fill="#1a1a1a"/>
       <text x="50%" y="50%" fill="#888" font-family="sans-serif" font-size="20"
             text-anchor="middle">imagem não encontrada</text>
     </svg>`,
  )

const PAGE_NAME = 'live'

export const DEFAULT_IMAGE_URL =
  'https://imgs.search.brave.com/v54BsnMFR7TWZv14mW0P-ZnSrQjQ6g9clCQqlRV2lZ0/rs:fit:0:180:1:0/g:ce/aHR0cHM6Ly9maWxl/cy56aW5lY3VsdHVy/YWwuY29tL1JlcG9z/aXRvcmlvL1VwbG9h/ZC9TMy9tbGliLXVw/bG9hZHMvZnVsbC9t/YWZhbGRhLTItNWY3/NGYyMWIyNmJmOC5q/cGc'

/** Plain consts: referenced in the block text as `@chave@`. */
export const DEFAULT_CONSTS: Record<string, string> = {
  nome: 'Mafalda',
}

/** Fonts: key = font-family name (usable in the block style), value = font file URL. */
export const DEFAULT_FONTS: Record<string, string> = {
  Inter: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-400-normal.woff2',
}

export const DEFAULT_BLOCK_STYLE: Record<string, string> = {
  color: '#ffffff',
  background: '#000000cc',
  padding: '10px',
  'text-align': 'center',
  'font-weight': '700',
  'font-family': 'Inter',
}

export interface LivePsrtImageProps {
  /** Page background image URL. */
  imageUrl: string
  /** Page-level style (PSRT `$START` style segment). */
  pageStyle?: Record<string, string>
  /** Block text. May reference consts as `@chave@`. */
  text: string
  /** Block position/size as percentages of the reference image. */
  x: number
  y: number
  width: number
  size: number
  /** Block inline style (same keys as the PSRT style segment, e.g. `"text-align"`). */
  blockStyle?: Record<string, string>
  /** Plain consts (chave → valor), expanded in the text as `@chave@`. */
  consts?: Record<string, string>
  /** Fonts (família → URL). The key becomes a usable `font-family`; the URL goes to `$FONTS`. */
  fonts?: Record<string, string>
  /** Show/hide the caption block. */
  showTexts?: boolean
}

const num = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback

/** Serializes the friendly props into a PSRT document string. */
function buildPsrt(
  imageUrl: string,
  pageStyle: Record<string, string>,
  block: { text: string; x: number; y: number; width: number; size: number; style: Record<string, string> },
  consts: Record<string, string>,
  fonts: Record<string, string>,
): string {
  const lines = [
    `$START ${PAGE_NAME} | ${JSON.stringify(pageStyle ?? {})} | ${imageUrl || 'about:blank'}`,
    `>>${num(block.x, 0)},${num(block.y, 0)},${num(block.width, 80)},${num(block.size, 4)} | ${JSON.stringify(block.style ?? {})} | 1`,
    block.text ?? '',
    `$END ${PAGE_NAME}`,
  ]

  const fontUrls = Object.values(fonts ?? {}).filter(Boolean)
  if (fontUrls.length) {
    lines.push('$FONTS', ...fontUrls, '$ENDFONTS')
  }

  const constEntries = Object.entries(consts ?? {}).filter(([k]) => k.trim())
  if (constEntries.length) {
    lines.push('$CONSTS', ...constEntries.map(([k, v]) => `@ ${k} | ${v}`), '$ENDCONSTS')
  }

  return lines.join('\n') + '\n'
}

/** Injects @font-face rules so the `fonts` keys are usable as font-family in styles. */
function useInjectedFonts(fonts: Record<string, string> | undefined): void {
  const css = useMemo(
    () =>
      Object.entries(fonts ?? {})
        .filter(([family, url]) => family.trim() && url)
        .map(
          ([family, url]) =>
            `@font-face{font-family:'${family}';src:url('${url}');font-display:swap;}`,
        )
        .join('\n'),
    [fonts],
  )

  useEffect(() => {
    if (!css) return
    const el = document.createElement('style')
    el.dataset.psrtLiveFonts = 'true'
    el.textContent = css
    document.head.appendChild(el)
    return () => {
      document.head.removeChild(el)
    }
  }, [css])
}

/**
 * Wrapper whose props mirror the editable PSRT fields (image URL, the single text
 * block, plus consts and fonts as key/value lists). It assembles a PsrtDocument
 * from those props and feeds it to PSRTImage — everything is driven by Storybook's
 * native controls.
 */
export function LivePsrtImage({
  imageUrl,
  pageStyle = {},
  text,
  x,
  y,
  width,
  size,
  blockStyle = {},
  consts = {},
  fonts = {},
  showTexts = true,
}: LivePsrtImageProps) {
  useInjectedFonts(fonts)

  const psrt = useMemo(
    () => buildPsrt(imageUrl, pageStyle, { text, x, y, width, size, style: blockStyle }, consts, fonts),
    [imageUrl, pageStyle, text, x, y, width, size, blockStyle, consts, fonts],
  )
  const { document: doc, error } = usePsrtDoc(psrt)

  return (
    <div style={rootStyle}>
      {error ? <p style={errorStyle}>{error.message}</p> : null}
      {doc ? (
        <section style={{ maxWidth: 720, width: '100%' }}>
          <PSRTImage
            psrt={doc}
            pageName={PAGE_NAME}
            showTexts={showTexts}
            fallbackImage={NOT_FOUND_IMAGE}
          />
        </section>
      ) : !error ? (
        <p style={{ color: '#888', fontFamily: 'sans-serif' }}>Documento vazio</p>
      ) : null}
    </div>
  )
}

const rootStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
  background: '#111',
  minHeight: '100vh',
  padding: 16,
}

const errorStyle: CSSProperties = {
  color: '#e66',
  fontSize: 13,
  fontFamily: 'monospace',
  background: '#2a1a1a',
  border: '1px solid #5a2a2a',
  borderRadius: 4,
  padding: 8,
  maxWidth: 720,
  width: '100%',
  whiteSpace: 'pre-wrap',
}
