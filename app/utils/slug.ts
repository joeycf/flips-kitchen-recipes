// Slug helpers for the admin form. `slugify` turns a title into the URL segment the
// public recipe pages resolve by (/recipes/<slug>); uniqueness against existing rows
// is enforced separately at save time (see useRecipeAdmin → ensureUniqueSlug), which
// is why this stays a pure, side-effect-free string transform.

/** "Chicken Adobo!" → "chicken-adobo". Empty/punctuation-only input → "". */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD') // split accents off their base letters…
    .replace(/[̀-ͯ]/g, '') // …then drop the combining marks (é → e)
    .replace(/[^a-z0-9]+/g, '-') // any run of non-alphanumerics → a single hyphen
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
}

/**
 * Append a numeric suffix to a base slug ("lemon-pasta" → "lemon-pasta-2"). Used to
 * resolve collisions; `n` is the 1-based attempt, so n=1 returns the base unchanged.
 */
export function slugWithSuffix(base: string, n: number): string {
  return n <= 1 ? base : `${base}-${n}`
}
