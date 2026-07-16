import type { Database } from '~/types/database.types'

// Card grid data source. Fetches through the typed Supabase client inside
// useAsyncData so it runs on the server during SSR and is captured by the ISR
// route rules (see nuxt.config `routeRules['/']`).
export function useRecipes() {
  const supabase = useSupabaseClient<Database>()

  return useAsyncData('recipes:list', async () => {
    // Card fields plus each recipe's ingredient name_keys (lightweight — no full
    // ingredient rows or jsonb) to power the client-side ingredient filter. Keeping
    // the string literal inline preserves Supabase's row-type inference.
    const { data, error } = await supabase
      .from('recipes')
      .select(
        'id, slug, title, description, cuisine, hero_image, prep_minutes, cook_minutes, difficulty, tags, recipe_ingredients(name_key)',
      )
      .order('created_at', { ascending: false })

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return data ?? []
  })
}
