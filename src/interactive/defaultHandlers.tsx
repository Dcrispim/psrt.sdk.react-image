import { useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { InteractiveHandler } from './types.js'

function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  if (typeof document === 'undefined') return null
  return createPortal(
    <div className="psrt-iconst-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="psrt-iconst-modal__box" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  )
}

/** Parse + normalize an external URL, returning null if it is unsafe to open.
 * Allows only http(s), rejects embedded credentials (phishing vector). */
function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    if (parsed.username || parsed.password) return null
    return parsed.toString()
  } catch {
    return null
  }
}

/** `@link:` — clickable label that confirms before opening an external URL.
 
* 
~~~

@link:Nossa Pagina | https://nossa-pagina.com

~~~	
  uso no corpo:
  
  
  >> 1,1,100,100 | {} | 0
* conheça @link:Nossa Pagina@
 
*/
function LinkConst({ render, value }: { render: string; value: string }) {
  const [open, setOpen] = useState(false)
  const safeUrl = sanitizeUrl(value)
  const isInsecure = safeUrl != null && safeUrl.startsWith('http:')
  return (
    <>
      <button type="button" className="psrt-iconst psrt-iconst--link" onClick={() => setOpen(true)}>
        {render}
      </button>
      {open ? (
        <Modal onClose={() => setOpen(false)}>
          {safeUrl ? (
            <>
              <p className="psrt-iconst-modal__text">Você está saindo para um link externo:</p>
              {isInsecure ? (
                <p className="psrt-iconst-modal__badge" role="alert">
                  <span className="psrt-iconst-modal__badge-icon" aria-hidden="true">
                    ⚠
                  </span>
                  Não seguro — conexão sem criptografia (HTTP)
                </p>
              ) : null}
              <code className="psrt-iconst-modal__url">{safeUrl}</code>
            </>
          ) : (
            <p className="psrt-iconst-modal__text">Este link não pôde ser aberto por não ser seguro.</p>
          )}
          <div className="psrt-iconst-modal__actions">
            <button type="button" className="psrt-iconst-modal__cancel" onClick={() => setOpen(false)}>
              {safeUrl ? 'Cancelar' : 'Fechar'}
            </button>
            {safeUrl ? (
              <button
                type="button"
                className="psrt-iconst-modal__confirm"
                onClick={() => {
                  window.open(safeUrl, '_blank', 'noopener,noreferrer')
                  setOpen(false)
                }}
              >
                Abrir link
              </button>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </>
  )
}

/** `@desc:` — term that reveals a description card on hover/focus. */
function DescConst({ render, value }: { render: string; value: string }) {
  const [show, setShow] = useState(false)
  return (
    <span
      className="psrt-iconst psrt-iconst--desc"
      tabIndex={0}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {render}
      {show ? (
        <span role="tooltip" className="psrt-iconst-card">
          {value}
        </span>
      ) : null}
    </span>
  )
}

/** Built-in handlers, available even without a PsrtInteractiveProvider. */
export const defaultHandlers: InteractiveHandler[] = [
  { type: 'link', render: ({ render, value }) => <LinkConst render={render} value={value} /> },
  { type: 'desc', render: ({ render, value }) => <DescConst render={render} value={value} /> },
]
