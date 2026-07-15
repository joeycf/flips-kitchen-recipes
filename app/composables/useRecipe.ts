import type { Database } from '~/types/database.types'
import type { InstructionStep, RecipeIngredient, RecipeWithIngredients } from '~/types/recipe'

// Single recipe + its ingredients for the detail page, fetched server-side via
// useAsyncData (SSR + ISR). Resolves by `slug`; returns null for an unknown slug so
// the page can raise a clean 404.
export function useRecipe(slug: MaybeRefOrGetter<string>) {
  const supabase = useSupabaseClient<Database>()

  return useAsyncData<RecipeWithIngredients | null>(
    `recipe:${toValue(slug)}`,
    async () => {
      // One round-trip: the recipe plus its ingredients via the FK relationship,
      // ingredients ordered by `position`. maybeSingle() is the brief's `.single()`
      // but yields null (not a thrown error) for a missing row → a proper 404 below,
      // not a 500.
      const { data, error } = await supabase
        .from('recipes')
        .select('*, recipe_ingredients(*)')
        .eq('slug', toValue(slug))
        .order('position', { referencedTable: 'recipe_ingredients', ascending: true })
        .maybeSingle()

      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      if (!data) return null

      // `instructions` is jsonb (typed Json) — narrow it to the structured step list.
      return {
        ...data,
        instructions: Array.isArray(data.instructions)
          ? (data.instructions as unknown as InstructionStep[])
          : [],
        recipe_ingredients: (data.recipe_ingredients ?? []) as RecipeIngredient[],
      }
    },
    // Refetch when navigating between recipes client-side (same component, new param).
    { watch: [() => toValue(slug)] },
  )
}
