// Pure presentation helpers for recipe data. The database stores structured values
// (numeric quantities, free-text difficulty, minutes); these turn them into the
// display strings the design calls for. Auto-imported by Nuxt from app/utils.

// --- Amounts ----------------------------------------------------------------

// Common cooking fractions, rendered as single-glyph vulgar fractions so a stored
// 0.5 reads as "½ cup" rather than "0.5 cup". Ordered for a simple nearest match.
const FRACTIONS: ReadonlyArray<[number, string]> = [
  [1 / 8, '⅛'],
  [1 / 4, '¼'],
  [1 / 3, '⅓'],
  [3 / 8, '⅜'],
  [1 / 2, '½'],
  [5 / 8, '⅝'],
  [2 / 3, '⅔'],
  [3 / 4, '¾'],
  [7 / 8, '⅞'],
]

/** Format a numeric quantity as a cook-friendly string ("0.5" → "½", "1.5" → "1½"). */
export function formatQuantity(quantity: number | null | undefined): string {
  if (quantity == null) return ''
  const whole = Math.floor(quantity)
  const frac = quantity - whole
  for (const [value, glyph] of FRACTIONS) {
    if (Math.abs(frac - value) < 0.02) return whole ? `${whole}${glyph}` : glyph
  }
  // No tidy fraction — drop trailing zeros (2.00 → "2", 1.25 → "1.25").
  return String(Number(quantity.toFixed(2)))
}

/**
 * Parse a cook-typed amount back to a number for storage — the inverse of formatQuantity.
 * Accepts decimals ("0.5"), simple fractions ("1/2") and mixed numbers ("1 1/2"). Returns
 * null for blank or unparseable input (e.g. "to taste"), which the schema allows.
 */
export function parseQuantity(raw: string | number | null | undefined): number | null {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null
  const s = String(raw ?? '').trim()
  if (!s) return null
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/)
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3])
  const frac = s.match(/^(\d+)\/(\d+)$/)
  if (frac) return Number(frac[2]) === 0 ? null : Number(frac[1]) / Number(frac[2])
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

/** Combine quantity + unit into one label, e.g. `formatAmount(0.5, 'cup')` → "½ cup". */
export function formatAmount(
  quantity: number | null | undefined,
  unit: string | null | undefined,
): string {
  return [formatQuantity(quantity), unit?.trim()].filter(Boolean).join(' ').trim()
}

// --- Times ------------------------------------------------------------------

/** Prep + cook, treating nulls as 0. Returns null only when both are missing. */
export function totalMinutes(
  prep: number | null | undefined,
  cook: number | null | undefined,
): number | null {
  if (prep == null && cook == null) return null
  return (prep ?? 0) + (cook ?? 0)
}

/** ISO-8601 duration for schema.org (e.g. 45 → "PT45M"). Null for missing values. */
export function isoDuration(minutes: number | null | undefined): string | null {
  return minutes == null ? null : `PT${minutes}M`
}

// --- Difficulty -------------------------------------------------------------

// `recipes.difficulty` is free text; map the words we expect onto the 5-dot scale
// from the design. Unknown but present values fall back to the middle dot so the
// meter still renders, and the original text is shown as the label.
const DIFFICULTY_LEVELS: Record<string, number> = {
  beginner: 1,
  'very easy': 1,
  easy: 2,
  medium: 3,
  moderate: 3,
  intermediate: 3,
  hard: 4,
  difficult: 4,
  advanced: 5,
  expert: 5,
}

export interface DifficultyMeta {
  /** Filled dots, 0–5 (0 when difficulty is absent). */
  level: number
  /** Human label for the meter, capitalized (empty when absent). */
  label: string
}

export function difficultyMeta(difficulty: string | null | undefined): DifficultyMeta {
  const text = difficulty?.trim()
  if (!text) return { level: 0, label: '' }
  const level = DIFFICULTY_LEVELS[text.toLowerCase()] ?? 3
  return { level, label: text.charAt(0).toUpperCase() + text.slice(1) }
}

// Reverse direction for the admin editor: the 1–5 difficulty meter maps back to the
// canonical free-text value stored in `difficulty`. Index 0 = unset. Round-trips through
// difficultyMeta() (e.g. "Very easy" → level 1 → "Very easy").
const DIFFICULTY_BY_LEVEL = ['', 'Very easy', 'Easy', 'Medium', 'Hard', 'Advanced'] as const

/** Map a 1–5 meter level to its canonical difficulty text; 0/out-of-range → null. */
export function difficultyForLevel(level: number): string | null {
  return DIFFICULTY_BY_LEVEL[level] || null
}

// --- YouTube ----------------------------------------------------------------

/**
 * Extract an 11-char YouTube video id from the common URL shapes (watch, youtu.be,
 * embed, shorts) or accept a bare id. Returns null when nothing matches so callers
 * can hide the embed.
 */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  )
  if (match) return match[1] ?? null
  return /^[\w-]{11}$/.test(url) ? url : null
}
