// Write-side shapes for the admin editor. The public read shapes live in ./recipe.ts;
// these are the drafts the form holds while editing and the normalized payload the CRUD
// composable (useRecipeAdmin) persists.

import type { InstructionStep } from './recipe'

// --- Form-local drafts (what the reactive form binds to) --------------------

// One ingredient row. `id` is a client-only key so Vue can track rows across reorders
// and removals; `qty` stays a raw string (the <input>'s value) and is parsed to a
// numeric quantity only at save time.
export interface IngredientDraft {
  id: string
  qty: string
  unit: string
  name: string
}

// One method step. `id` mirrors IngredientDraft's role; `image` is carried through
// unchanged (the schema supports per-step images even though the form doesn't set one yet).
export interface StepDraft {
  id: string
  text: string
  image?: string | null
}

// --- Normalized payload (what gets written to Postgres) ---------------------

export interface IngredientPayload {
  position: number
  quantity: number | null
  unit: string | null
  name: string
  name_key: string | null
}

// The recipe row fields the form owns (created_at/updated_at/id/slug are handled by the
// composable, not the form) plus the reconciled ingredient rows.
export interface RecipeFormPayload {
  title: string
  description: string | null
  cuisine: string | null
  hero_image: string | null
  gallery: string[]
  youtube_url: string | null
  prep_minutes: number | null
  cook_minutes: number | null
  servings: number | null
  difficulty: string | null
  tags: string[]
  instructions: InstructionStep[]
  ingredients: IngredientPayload[]
}
