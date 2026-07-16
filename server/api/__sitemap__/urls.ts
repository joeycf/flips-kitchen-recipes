import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

// Dynamic sitemap source (wired via `sitemap.sources` in nuxt.config). @nuxtjs/sitemap
// merges these entries with the statically-discovered pages, so the generated
// sitemap.xml lists every recipe detail route alongside the home page.
//
// Reads slugs through the anon Supabase client — an unauthenticated crawler carries no
// session, so this runs as the public role, which RLS allows to SELECT recipes.
export default defineSitemapEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)

  const { data, error } = await supabase
    .from('recipes')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false })

  if (error) return []

  return (data ?? []).map((recipe) => ({
    loc: `/recipes/${recipe.slug}`,
    lastmod: recipe.updated_at,
  }))
})
