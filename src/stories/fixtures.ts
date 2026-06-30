/**
 * Default PSRT document used when no .psrt file is uploaded in Storybook. It uses
 * remote image + font URLs so the stories render without an asset registry or the
 * local connector — the same way `test-intro-context.psrt` works at the repo root.
 */
export const introPsrt = `$START intro | {} | https://cdn.nexustoons.com/manga_pages/317/28583/page_1_d5bf6a1a.avif
>>11,55.5,77,3 | {"color":"#f1f1f1ff","font-weight":"600","background":"#000000ff","padding":"10px","text-align":"center","direction":"ltr"} | 1
O Soberando supremo da eternidade
>>9.5,69,27,3 | {"color":"#ffffff","background":"#000000","padding":"8px","text-align":"center","font-weight":"700"} | 2
Tradutor
>>41,69,23,3 | {"color":"#ffffff","background":"#ff0000","padding":"8px","text-align":"center","font-weight":"700"} | 3
Revisor
>>65,70.5,22.5,2 | {"color":"#ffffff","background":"#0084ff","padding":"8px","font-weight":"700","text-align":"right","font-size":"10px"} | 4
Limpador
$END intro
$FONTS
https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-400-normal.woff2
https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.8/files/roboto-latin-400-normal.woff2
$ENDFONTS
$CONSTS
@ accent_spotify | #1DB954
@ shadow_card | "boxShadow":"0 8px 24px rgba(0,0,0,0.35)"
@ text_secondary | #A1A1AA
$ENDCONSTS
`

/** Name of the first page in {@link introPsrt} — used as the default selected page. */
export const introFirstPage = 'intro'
