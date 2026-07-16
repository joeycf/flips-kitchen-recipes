<template>
  <main id="main-content" tabindex="-1" class="relative z-10 mx-auto max-w-shell px-6 pb-24 pt-10">
    <div class="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-clay">
          Admin
        </p>
        <h1
          class="mt-2 font-display text-[clamp(28px,4vw,40px)] font-semibold tracking-tight text-ink"
        >
          Recipes
        </h1>
      </div>
      <NuxtLink
        to="/admin/new"
        class="inline-flex items-center gap-1.5 rounded-field bg-clay px-4 py-2.5 text-[13.5px] font-semibold text-[#FFF7EF] shadow-clay transition hover:bg-clay-deep"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        New recipe
      </NuxtLink>
    </div>

    <ListSkeleton v-if="pending" />

    <div
      v-else-if="error"
      class="rounded-card border border-line bg-paper p-8 text-center text-ink-soft"
    >
      Couldn’t load recipes. Please refresh.
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!recipes || recipes.length === 0"
      class="rounded-card border border-dashed border-[#D9CCB6] bg-paper p-12 text-center"
    >
      <h2 class="font-display text-[22px] font-semibold text-ink">No recipes yet</h2>
      <p class="mx-auto mt-2 max-w-[42ch] text-[14px] leading-relaxed text-ink-soft">
        Add your first recipe and it’ll appear on the public site.
      </p>
      <NuxtLink
        to="/admin/new"
        class="mt-5 inline-flex items-center gap-1.5 rounded-field bg-clay px-5 py-3 text-[14px] font-semibold text-[#FFF7EF] shadow-clay transition hover:bg-clay-deep"
      >
        Create a recipe
      </NuxtLink>
    </div>

    <!-- List -->
    <ul v-else class="flex flex-col gap-2.5">
      <li
        v-for="recipe in recipes"
        :key="recipe.id"
        class="flex items-center gap-4 rounded-card border border-line bg-paper p-3 shadow-card"
      >
        <div
          class="h-16 w-16 flex-none overflow-hidden rounded-[12px] border border-line bg-clay-tint"
        >
          <NuxtImg
            v-if="recipe.hero_image"
            :src="recipe.hero_image"
            :alt="recipe.title"
            class="h-full w-full object-cover"
            width="64"
            height="64"
            fit="cover"
            format="webp"
            loading="lazy"
          />
          <span v-else class="flex h-full w-full items-center justify-center text-clay">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </span>
        </div>

        <div class="min-w-0 flex-1">
          <p
            v-if="recipe.cuisine"
            class="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-clay"
          >
            {{ recipe.cuisine }}
          </p>
          <h3 class="truncate font-display text-[19px] font-semibold leading-tight text-ink">
            {{ recipe.title }}
          </h3>
          <p class="mt-0.5 text-[12.5px] text-ink-faint">
            Updated {{ formatDate(recipe.updated_at) }}
          </p>
        </div>

        <!-- Actions / inline delete confirm -->
        <div class="flex flex-none items-center gap-2">
          <template v-if="confirmingId === recipe.id">
            <span class="text-[13px] text-ink-soft">Delete?</span>
            <button
              type="button"
              :disabled="deletingId === recipe.id"
              class="rounded-field bg-clay-deep px-3.5 py-2 text-[13px] font-semibold text-[#FFF7EF] transition hover:bg-clay disabled:opacity-60"
              @click="doDelete(recipe)"
            >
              {{ deletingId === recipe.id ? 'Deleting…' : 'Yes, delete' }}
            </button>
            <button
              type="button"
              class="rounded-field border border-line bg-paper px-3.5 py-2 text-[13px] font-semibold text-ink-soft transition hover:bg-cream"
              @click="confirmingId = null"
            >
              Cancel
            </button>
          </template>
          <template v-else>
            <NuxtLink
              :to="`/admin/edit/${recipe.id}`"
              class="inline-flex items-center gap-1.5 rounded-field border border-line bg-paper px-3.5 py-2 text-[13px] font-semibold text-ink transition hover:border-[#D9CCB6] hover:bg-cream"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
              </svg>
              Edit
            </NuxtLink>
            <button
              type="button"
              aria-label="Delete recipe"
              class="inline-flex items-center gap-1.5 rounded-field border border-line bg-paper px-3.5 py-2 text-[13px] font-semibold text-ink-soft transition hover:border-[#E4C0B0] hover:bg-clay-tint hover:text-clay-deep"
              @click="confirmingId = recipe.id"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
              Delete
            </button>
          </template>
        </div>
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
// Explicit import — components/admin/ is path-prefixed by Nuxt auto-import.
import ListSkeleton from '~/components/admin/ListSkeleton.vue'
import type { Database } from '~/types/database.types'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const supabase = useSupabaseClient<Database>()
const { deleteRecipe } = useRecipeAdmin()
const { notifyDeleted, notifyError } = useAdminFlash()

// Client-side fetch (the admin section is ssr:false). Ordered most-recently-updated first.
const {
  data: recipes,
  pending,
  error,
  refresh,
} = useAsyncData('admin:recipes', async () => {
  const { data, error: dbError } = await supabase
    .from('recipes')
    .select('id, slug, title, cuisine, updated_at, hero_image, gallery')
    .order('updated_at', { ascending: false })
  if (dbError) throw createError({ statusCode: 500, statusMessage: dbError.message })
  return data ?? []
})

const confirmingId = ref<string | null>(null)
const deletingId = ref<string | null>(null)

async function doDelete(recipe: { id: string; hero_image: string | null; gallery: string[] }) {
  deletingId.value = recipe.id
  try {
    await deleteRecipe(recipe.id, { hero_image: recipe.hero_image, gallery: recipe.gallery })
    confirmingId.value = null
    notifyDeleted()
    await refresh()
  } catch (e) {
    notifyError(e instanceof Error ? e.message : 'Could not delete the recipe.')
  } finally {
    deletingId.value = null
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

useHead({ title: 'Recipes · Admin' })
</script>
