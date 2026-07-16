// Recipe domain model — derived from the Supabase schema so the database stays
// the single source of truth. Column shapes live in ./database.types.ts; this
// file layers on the app-facing names and the structured jsonb shapes that
// Postgres stores untyped.

import type { Database } from './database.types'

// --- Table rows, straight from the schema -----------------------------------

export type Recipe = Database['public']['Tables']['recipes']['Row']
export type RecipeInsert = Database['public']['Tables']['recipes']['Insert']
export type RecipeUpdate = Database['public']['Tables']['recipes']['Update']

// One row per ingredient — powers both the pretty ingredient line
// (quantity/unit/name) and the filter facets (name_key). `cuisine` is NOT here:
// it's a first-class column on `recipes`, kept separate from the tag pills.
export type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row']
export type RecipeIngredientInsert = Database['public']['Tables']['recipe_ingredients']['Insert']
export type RecipeIngredientUpdate = Database['public']['Tables']['recipe_ingredients']['Update']

// --- Structured jsonb shapes ------------------------------------------------

// One step in `recipes.instructions` (stored as jsonb, typed as Json in the
// schema). Ordered [{ text, image? }, ...] — the admin form writes it and the
// detail page renders the numbered steps.
export interface InstructionStep {
  text: string
  image?: string | null
}

// --- Card read shape --------------------------------------------------------

// The trimmed shape the home grid + client-side filtering need: card columns plus
// each recipe's ingredient `name_key`s (only) for the ingredient filter — no heavy
// jsonb or full ingredient rows. Matches the select in `useRecipes`.
export type RecipeCardData = Pick<
  Recipe,
  | 'id'
  | 'slug'
  | 'title'
  | 'description'
  | 'cuisine'
  | 'hero_image'
  | 'prep_minutes'
  | 'cook_minutes'
  | 'difficulty'
  | 'tags'
> & {
  recipe_ingredients: Pick<RecipeIngredient, 'name_key'>[]
}

// --- Joined read shape ------------------------------------------------------

// A recipe with its instructions narrowed to the structured step list and its
// ingredient rows joined in — the common read shape for the public detail page
// and the admin editor (e.g. `.select('*, recipe_ingredients(*)')`).
export type RecipeWithIngredients = Omit<Recipe, 'instructions'> & {
  instructions: InstructionStep[]
  recipe_ingredients: RecipeIngredient[]
}
