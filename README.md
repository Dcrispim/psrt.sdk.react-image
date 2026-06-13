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
