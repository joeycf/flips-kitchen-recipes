import Fuse from 'fuse.js'
import type { IFuseOptions } from 'fuse.js'
import type { RecipeCardData } from '~/types/recipe'

// Curated filter chips (fixed — matches the design). Edit this one list to change the row.
export const FILTER_CHIPS = [
  'Chicken',
  'Pork',
  'Beef',
  'Seafood',
  'Noodles',
  'Rice',
  'Coconut',
  'Vegetarian',
  'Spicy',
  'Quick',
] as const

// How multiple selected chips combine: 'any' = OR (default), 'all' = AND. Behind a
// constant so it can be flipped without touching the filter logic.
const CHIP_COMBINE: 'any' | 'all' = 'any'

// "Quick" chip: by default it matches the same tag/ingredient rule as every other chip.
// Flip this to instead match recipes whose total time is at/under QUICK_MAX_MINUTES.
const TREAT_QUICK_AS_TIME = false
const QUICK_MAX_MINUTES = 30

// Debounce applied to the search input before it writes to the URL (~250ms).
const URL_SYNC_DEBOUNCE_MS = 250

// Flattened, lower-cased projection Fuse indexes over — avoids nested-path/null quirks
// and keeps the searchable text separate from the recipe object we hand back.
interface Indexed {
  recipe: RecipeCardData
  title: string
  cuisine: string
  tags: string[]
  ingredients: string[]
}

const FUSE_OPTIONS: IFuseOptions<Indexed> = {
  threshold: 0.35, // forgiving of typos, but not so loose it turns noisy
  ignoreLocation: true, // match anywhere in the field, not just the start
  minMatchCharLength: 2,
  keys: [
    { name: 'title', weight: 0.5 },
    { name: 'cuisine', weight: 0.2 },
    { name: 'ingredients', weight: 0.2 },
    { name: 'tags', weight: 0.1 },
  ],
}

function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined
  return (...args: A) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

// Parse the `tags` query param into known chips, in the curated order (drops unknowns
// and normalizes case so a pasted URL restores exactly the on-screen selection).
function parseTags(value: unknown): string[] {
  const raw = typeof value === 'string' ? value : ''
  if (!raw) return []
  const wanted = raw.split(',').map((s) => s.trim().toLowerCase())
  return FILTER_CHIPS.filter((chip) => wanted.includes(chip.toLowerCase()))
}

/**
 * Client-side search + chip filtering over the already-loaded recipe list. State
 * (query + chips) is seeded from the URL so SSR and hydration derive the same filtered
 * set, and is written back to the URL (debounced, via replace) so views are shareable
 * and survive refresh.
 */
export function useRecipeSearch(recipes: Ref<RecipeCardData[] | null | undefined>) {
  const route = useRoute()
  const router = useRouter()

  // Seed from the URL — identical on server + client → no hydration mismatch.
  const search = ref(typeof route.query.q === 'string' ? route.query.q : '')
  const selectedChips = ref<string[]>(parseTags(route.query.tags))

  const list = computed(() => recipes.value ?? [])

  // Build the Fuse index from the loaded list. Memoized by `computed`, so it's rebuilt
  // only if the list identity changes (it doesn't after the initial fetch).
  const indexed = computed<Indexed[]>(() =>
    list.value.map((r) => ({
      recipe: r,
      title: r.title,
      cuisine: r.cuisine ?? '',
      tags: r.tags,
      ingredients: r.recipe_ingredients
        .map((i) => i.name_key)
        .filter((k): k is string => Boolean(k)),
    })),
  )
  const fuse = computed(() => new Fuse(indexed.value, FUSE_OPTIONS))

  // Text pass: fuzzy match, or the whole list (in fetch order) when the box is empty.
  const textMatched = computed<RecipeCardData[]>(() => {
    const q = search.value.trim()
    if (!q) return list.value
    return fuse.value.search(q).map((res) => res.item.recipe)
  })

  // Chip pass over the text-matched set. A recipe matches a chip when the chip term is
  // one of its `tags` (exact, discrete pills) OR appears as a whole WORD inside any
  // ingredient name_key — so "Chicken" catches a "chicken thighs" ingredient, while
  // staying word-scoped (it won't match "chickpea"). Case-insensitive throughout.
  const filtered = computed<RecipeCardData[]>(() => {
    const chips = selectedChips.value
    if (!chips.length) return textMatched.value

    const terms = chips.map((c) => c.toLowerCase())
    return textMatched.value.filter((r) => {
      const tags = new Set(r.tags.map((t) => t.toLowerCase()))
      // Every distinct word across the recipe's ingredient name_keys.
      const ingredientWords = new Set<string>()
      for (const ing of r.recipe_ingredients) {
        const key = ing.name_key?.toLowerCase()
        if (!key) continue
        for (const word of key.split(/[^a-z0-9]+/)) if (word) ingredientWords.add(word)
      }
      const matches = (term: string) => {
        if (tags.has(term) || ingredientWords.has(term)) return true
        if (term === 'quick' && TREAT_QUICK_AS_TIME) {
          const total = totalMinutes(r.prep_minutes, r.cook_minutes)
          return total != null && total <= QUICK_MAX_MINUTES
        }
        return false
      }
      return CHIP_COMBINE === 'all' ? terms.every(matches) : terms.some(matches)
    })
  })

  const resultCount = computed(() => filtered.value.length)
  const hasActiveFilters = computed(
    () => search.value.trim().length > 0 || selectedChips.value.length > 0,
  )
  // Distinct from the empty-DB EmptyState: recipes exist, but none match the query/chips.
  const showNoResults = computed(() => list.value.length > 0 && filtered.value.length === 0)

  function clearFilters() {
    search.value = ''
    selectedChips.value = []
  }

  // --- URL sync ---------------------------------------------------------------
  // Local → URL. Debounced so typing doesn't spam navigation; replace (not push) keeps
  // history clean; guarded to skip redundant writes (which also prevents a feedback
  // loop with the URL → local watcher below).
  const syncUrl = debounce(() => {
    const q = search.value.trim()
    const tags = selectedChips.value.join(',')
    const currentQ = typeof route.query.q === 'string' ? route.query.q : ''
    const currentTags = typeof route.query.tags === 'string' ? route.query.tags : ''
    if (q === currentQ && tags === currentTags) return

    const query: Record<string, string> = {}
    if (q) query.q = q
    if (tags) query.tags = tags
    router.replace({ query })
  }, URL_SYNC_DEBOUNCE_MS)

  watch([search, selectedChips], syncUrl)

  // URL → local (browser back/forward, or a pasted filtered link navigated to). Guarded
  // so equal values don't re-trigger the writer.
  watch(
    () => route.query,
    (q) => {
      const urlQ = typeof q.q === 'string' ? q.q : ''
      if (urlQ !== search.value) search.value = urlQ

      const urlTags = parseTags(q.tags)
      if (urlTags.join(',') !== selectedChips.value.join(',')) selectedChips.value = urlTags
    },
  )

  return {
    search,
    selectedChips,
    chips: FILTER_CHIPS,
    filtered,
    resultCount,
    hasActiveFilters,
    showNoResults,
    clearFilters,
  }
}
