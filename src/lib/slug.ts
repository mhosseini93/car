// Mirrors the backend rule: lowercase latin, digits and Persian letters joined by single hyphens
export const SLUG_PATTERN = /^[a-z0-9؀-ۿ]+(?:-[a-z0-9؀-ۿ]+)*$/

export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[ً-ٰٟ]/g, "") // Arabic diacritics
    .replace(/[\s‌_]+/g, "-") // spaces and zero-width non-joiner
    .replace(/[^a-z0-9؀-ۿ-]/g, "")
    .replace(/[،؛؟٪-٭]/g, "") // Persian punctuation
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 150)
}
