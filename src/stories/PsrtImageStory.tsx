import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { PSRTImage } from '../components/PSRTImage.js'
import { usePsrtDoc } from './usePsrtDoc.js'
import { introPsrt } from './fixtures.js'

const NOT_FOUND_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560">
       <rect width="100%" height="100%" fill="#1a1a1a"/>
       <text x="50%" y="50%" fill="#888" font-family="sans-serif" font-size="20"
             text-anchor="middle">imagem não encontrada</text>
     </svg>`,
  )

/**
 * Reads the .psrt uploaded through Storybook's `file` control (which hands back
 * object URLs) and returns its text. Falls back to the bundled sample document
 * when nothing is uploaded — mirrors the Reader's "load a .psrt" entry point.
 */
function usePsrtFileText(fileUrls: readonly string[] | undefined): {
  text: string | null
  loading: boolean
} {
  const url = fileUrls?.[0]
  const [text, setText] = useState<string | null>(url ? null : introPsrt)
  const [loading, setLoading] = useState(Boolean(url))

  useEffect(() => {
    if (!url) {
      setText(introPsrt)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetch(url)
      .then((r) => r.text())
      .then((t) => {
        if (!cancelled) {
          setText(t)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setText(introPsrt)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [url])

  return { text, loading }
}

/** Resolves which page to render: the chosen one if it exists, else the first. */
function useActivePage(
  pages: string[],
  pageName: string,
): readonly [string, (next: string) => void] {
  const [page, setPage] = useState(pageName)
  useEffect(() => setPage(pageName), [pageName])
  const active = pages.includes(page) ? page : (pages[0] ?? pageName)
  return [active, setPage] as const
}

function PageSelect({
  pages,
  value,
  onChange,
}: {
  pages: string[]
  value: string
  onChange: (next: string) => void
}) {
  if (pages.length <= 1) return null
  return (
    <label style={pageSelectStyle}>
      Página:
      <select value={value} onChange={(e) => onChange(e.target.value)} style={selectStyle}>
        {pages.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  )
}

interface BaseProps {
  /** Object URLs from Storybook's file control; first entry is read as the .psrt source. */
  psrtFile?: readonly string[]
  /** Selected page to render. */
  pageName: string
}

/**
 * Reader-style usage: scrollable page, captions toggleable, remote image.
 * Mirrors how `ReaderApp` mounts `<PSRTImage>`.
 */
export function ReaderStory({
  psrtFile,
  pageName,
  showTexts,
}: BaseProps & { showTexts: boolean }) {
  const { text, loading: fileLoading } = usePsrtFileText(psrtFile)
  const { document, loading, error } = usePsrtDoc(text)
  const pages = useMemo(() => document?.pages.map((p) => p.name) ?? [], [document])
  const [activePage, setActivePage] = useActivePage(pages, pageName)

  if (fileLoading || loading) return <p style={statusStyle}>Carregando documento…</p>
  if (error) return <p style={statusStyle}>{error.message}</p>
  if (!document) return <p style={statusStyle}>Documento vazio</p>

  return (
    <div style={readerScrollStyle}>
      <PageSelect pages={pages} value={activePage} onChange={setActivePage} />
      <section style={{ maxWidth: 720, width: '100%' }}>
        <PSRTImage
          psrt={document}
          pageName={activePage}
          showTexts={showTexts}
          fallbackImage={NOT_FOUND_IMAGE}
        />
      </section>
    </div>
  )
}

/**
 * Editor/Canvas-style usage: fixed reference size, zoom via `scale`, clickable
 * blocks and a selection overlay. Mirrors `WebPreview` in canvas mode.
 */
export function EditorStory({
  psrtFile,
  pageName,
  scale,
  showTexts,
}: BaseProps & { scale: number; showTexts: boolean }) {
  const { text, loading: fileLoading } = usePsrtFileText(psrtFile)
  const { document, loading, error } = usePsrtDoc(text)
  const pages = useMemo(() => document?.pages.map((p) => p.name) ?? [], [document])
  const [activePage, setActivePage] = useActivePage(pages, pageName)
  const [selected, setSelected] = useState<number | null>(null)

  if (fileLoading || loading) return <p style={statusStyle}>Carregando documento…</p>
  if (error) return <p style={statusStyle}>{error.message}</p>
  if (!document) return <p style={statusStyle}>Documento vazio</p>

  const applyEditorStyles = (blockId: string | number): CSSProperties => {
    const idx = typeof blockId === 'number' ? blockId : Number.parseInt(String(blockId), 10)
    if (idx !== selected) return {}
    return {
      outline: `${Math.max(1, scale) * 2}px dashed #1db954`,
      outlineOffset: 2,
    }
  }

  return (
    <div style={editorStageStyle}>
      <div style={toolbarStyle}>
        <PageSelect pages={pages} value={activePage} onChange={setActivePage} />
        <span>
          {selected == null ? 'Clique em um bloco para selecioná-lo' : `Bloco selecionado: #${selected}`}
        </span>
      </div>
      <PSRTImage
        psrt={document}
        pageName={activePage}
        scale={scale}
        showTexts={showTexts}
        fixedReferenceSize
        enableEditor
        onSelectBlock={setSelected}
        applyEditorStyles={applyEditorStyles}
        fallbackImage={NOT_FOUND_IMAGE}
      />
    </div>
  )
}

const statusStyle: CSSProperties = {
  fontFamily: 'sans-serif',
  color: '#888',
  padding: 24,
}

const readerScrollStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
  background: '#111',
  minHeight: '100vh',
  padding: 16,
}

const editorStageStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 8,
  background: '#1e1e1e',
  minHeight: '100vh',
  padding: 16,
  overflow: 'auto',
}

const toolbarStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  fontFamily: 'sans-serif',
  fontSize: 13,
  color: '#aaa',
}

const pageSelectStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontFamily: 'sans-serif',
  fontSize: 13,
  color: '#aaa',
}

const selectStyle: CSSProperties = {
  background: '#2a2a2a',
  color: '#eee',
  border: '1px solid #444',
  borderRadius: 4,
  padding: '2px 6px',
}
