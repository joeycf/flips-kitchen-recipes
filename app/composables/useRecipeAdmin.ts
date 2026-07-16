import type { Database, Json } from '~/types/database.types'
import type { RecipeFormPayload } from '~/types/admin'
import type { InstructionStep, RecipeIngredient, RecipeWithIngredients } from '~/types/recipe'

export interface SaveResult {
  id: string
  slug: string
}

// All write access to Supabase lives here: create / edit / delete recipes, slug
// uniqueness, and Storage image upload + cleanup. Every method surfaces failures by
// throwing an Error (RLS denials, network, validation) so the calling page can show them.
export function useRecipeAdmin() {
  const supabase = useSupabaseClient<Database>()
  const BUCKET = 'recipe-images'

  function fail(message: string): never {
    throw new Error(message)
  }

  // Flatten the form payload to the `recipes` column set (everything except the
  // ingredient rows, which live in their own table). Shared by insert + update.
  function recipeColumns(payload: RecipeFormPayload) {
    return {
      title: payload.title,
      description: payload.description,
      cuisine: payload.cuisine,
      hero_image: payload.hero_image,
      gallery: payload.gallery,
      youtube_url: payload.youtube_url,
      prep_minutes: payload.prep_minutes,
      cook_minutes: payload.cook_minutes,
      servings: payload.servings,
      difficulty: payload.difficulty,
      tags: payload.tags,
      // instructions is jsonb; the structured step list is Json-compatible at runtime.
      instructions: payload.instructions as unknown as Json,
    }
  }

  // --- Slug uniqueness --------------------------------------------------------

  /**
   * Resolve a collision-free slug from a title. Pulls existing slugs sharing the base
   * stem and returns the first of base, base-2, base-3, … that's free. Only used when
   * creating — edits keep their existing slug so links stay stable.
   */
  async function ensureUniqueSlug(title: string): Promise<string> {
    const base = slugify(title) || 'recipe'
    const { data, error } = await supabase.from('recipes').select('slug').like('slug', `${base}%`)
    if (error) fail(error.message)

    const taken = new Set((data ?? []).map((r) => r.slug))
    for (let n = 1; ; n++) {
      const candidate = slugWithSuffix(base, n)
      if (!taken.has(candidate)) return candidate
    }
  }

  // --- Load (edit) ------------------------------------------------------------

  /** Fetch a recipe + its ordered ingredients by id, for seeding the edit form. */
  async function loadForEdit(id: string): Promise<RecipeWithIngredients | null> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*, recipe_ingredients(*)')
      .eq('id', id)
      .order('position', { referencedTable: 'recipe_ingredients', ascending: true })
      .maybeSingle()
    if (error) fail(error.message)
    if (!data) return null

    return {
      ...data,
      instructions: Array.isArray(data.instructions)
        ? (data.instructions as unknown as InstructionStep[])
        : [],
      recipe_ingredients: (data.recipe_ingredients ?? []) as RecipeIngredient[],
    }
  }

  // --- Create / update --------------------------------------------------------

  async function insertIngredients(recipeId: string, payload: RecipeFormPayload) {
    if (!payload.ingredients.length) return
    const rows = payload.ingredients.map((ing) => ({ recipe_id: recipeId, ...ing }))
    const { error } = await supabase.from('recipe_ingredients').insert(rows)
    if (error) fail(error.message)
  }

  async function createRecipe(payload: RecipeFormPayload): Promise<SaveResult> {
    const slug = await ensureUniqueSlug(payload.title)
    const { data, error } = await supabase
      .from('recipes')
      .insert({ ...recipeColumns(payload), slug })
      .select('id, slug')
      .single()
    if (error) fail(error.message)

    try {
      await insertIngredients(data.id, payload)
    } catch (e) {
      // Don't leave an orphan recipe row if its ingredients fail to write.
      await supabase.from('recipes').delete().eq('id', data.id)
      throw e
    }
    return { id: data.id, slug: data.slug }
  }

  async function updateRecipe(
    id: string,
    slug: string,
    payload: RecipeFormPayload,
  ): Promise<SaveResult> {
    const { error } = await supabase.from('recipes').update(recipeColumns(payload)).eq('id', id)
    if (error) fail(error.message)

    // Reconcile ingredients by replacing the set — simplest correct approach for the
    // handful of rows a recipe has (the FK is ON DELETE CASCADE, but we scope by id).
    const { error: delError } = await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('recipe_id', id)
    if (delError) fail(delError.message)
    await insertIngredients(id, payload)

    return { id, slug }
  }

  /** Create when `editingId` is null, otherwise update that recipe (keeping its slug). */
  async function saveRecipe(
    payload: RecipeFormPayload,
    editingId: string | null,
    existingSlug: string | null,
  ): Promise<SaveResult> {
    if (editingId && existingSlug) return updateRecipe(editingId, existingSlug, payload)
    return createRecipe(payload)
  }

  // --- Delete -----------------------------------------------------------------

  /**
   * Delete a recipe (ingredients cascade via the FK). Best-effort: first removes the
   * recipe's Storage images so they don't orphan; a cleanup failure never blocks the
   * row delete.
   */
  async function deleteRecipe(
    id: string,
    images?: { hero_image?: string | null; gallery?: string[] },
  ): Promise<void> {
    const paths = [images?.hero_image, ...(images?.gallery ?? [])]
      .filter((u): u is string => Boolean(u))
      .map(storagePathFromPublicUrl)
      .filter((p): p is string => Boolean(p))
    if (paths.length) {
      try {
        await supabase.storage.from(BUCKET).remove(paths)
      } catch {
        /* Orphaned public images are harmless — never block the delete on cleanup. */
      }
    }

    const { error } = await supabase.from('recipes').delete().eq('id', id)
    if (error) fail(error.message)
  }

  // --- Image upload -----------------------------------------------------------

  /** Downscale + upload one image, returning its public URL to store on the recipe. */
  async function uploadImage(file: File, slugHint: string): Promise<string> {
    const { blob, ext, contentType } = await processImage(file)
    const folder = slugify(slugHint) || 'uploads'
    const path = `${folder}/${crypto.randomUUID()}-${sanitizeFilename(file.name)}.${ext}`
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { cacheControl: '3600', contentType, upsert: false })
    if (error) fail(error.message)
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  }

  return { loadForEdit, saveRecipe, deleteRecipe, uploadImage }
}
