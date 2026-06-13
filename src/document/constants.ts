/** Embedded SVG placeholder when no fallbackImage prop is provided. */
export const DEFAULT_FALLBACK_IMAGE =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#1a1a1a"/>
      <text x="200" y="150" text-anchor="middle" fill="#666" font-family="sans-serif" font-size="14">Image not found</text>
    </svg>`,
  )
