export type TocItem = { id: string; text: string; level: 2 | 3 }

const decodeEntities = (text: string) =>
  text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

// Gives h2/h3 headings anchor ids and returns them as a table of contents.
// The HTML is already sanitized by the backend, so headings carry no ids of their own.
export function withHeadingAnchors(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = []
  let index = 0

  const result = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/g, (_match, level, attrs, inner) => {
    const text = decodeEntities(inner.replace(/<[^>]+>/g, "")).trim()
    if (!text) return _match
    const id = `section-${++index}`
    toc.push({ id, text, level: Number(level) as 2 | 3 })
    return `<h${level} id="${id}"${attrs}>${inner}</h${level}>`
  })

  return { html: result, toc }
}
