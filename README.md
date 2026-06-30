# @psrt/react-image

React component to render PSRT pages with percent-based layout and live style adaptation.

## Install

```bash
npm install @psrt/react-image @psrt/sdk
```

## Usage

Call `initPsrt()` once at app startup (e.g. `main.tsx`), then use the components:

```tsx
// main.tsx
import { initPsrt } from '@psrt/sdk'

await initPsrt()

// render app...
```

```tsx
import { PSRTImage, usePsrtDocument } from '@psrt/react-image'
import '@psrt/react-image/style.css'

function Page({ psrtString }: { psrtString: string }) {
  const { document, loading, error } = usePsrtDocument(psrtString)

  if (loading) return null
  if (error || !document) return <p>Failed to load PSRT</p>

  return (
    <PSRTImage
      psrt={document}
      pageName="intro"
      scale={1}
      fallbackImage="/assets/not-found.png"
    />
  )
}
```

Pass a parsed document directly if you already have one:

```tsx
import { parse } from '@psrt/sdk'

const document = parse(psrtString)

<PSRTImage psrt={document} pageName="intro" scale={1} />
```

## Props

| Prop | Description |
|------|-------------|
| `psrt` | `PsrtDocument` in memory (not a raw string) |
| `pageName` | `$START` page name |
| `scale` | Zoom (default `1`) |
| `applyEditorStyles` | Optional UI overlay styles per block |
| `enableEditor` | Editor interaction mode |
| `fallbackImage` | Placeholder when image missing/invalid |

## Storybook

An interactive playground lives in `.storybook/` and `src/stories/`. It boots the
PSRT WASM runtime once (via a preview loader, mirroring `initPsrt()` in psrt.web)
and renders `PSRTImage` in two modes that mirror the app:

- **Reader** — scrollable page with toggleable captions (like `ReaderApp`).
- **Editor** — fixed reference size, zoom (`scale`), selectable blocks with a
  selection overlay (like the `WebPreview` canvas).
- **LiveMode** — a self-contained live editor where the image URL, each block's
  text, position (`x`/`y`/`width`/`size`) and style JSON are editable, with the
  PSRTImage re-rendering on every change.

The controls mirror the real use cases: upload a **`.psrt` file** to test the
page (empty falls back to the bundled sample) and pick the **selected page**
(`$START <name>`; multi-page documents also get a page selector in the canvas).

```bash
npm install
npm run storybook       # dev server on http://localhost:6007
npm run build-storybook # static build into storybook-static/
```

> Requires Node 20.x. The sample documents in `src/stories/fixtures.ts` use
> remote image/font URLs, so no asset registry or local connector is needed.
