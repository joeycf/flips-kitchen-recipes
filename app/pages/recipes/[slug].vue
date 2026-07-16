<template>
  <main class="relative z-10 mx-auto max-w-read px-6 pb-24 pt-6">
    <article v-if="recipe" ref="articleEl">
      <!-- Title block -->
      <div :data-reveal="revealAttr" class="mb-[22px] max-w-[720px]">
        <div
          v-if="recipe.cuisine"
          class="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-clay"
        >
          {{ recipe.cuisine }}
        </div>
        <h1
          class="mt-2.5 font-display text-[clamp(32px,5.5vw,50px)] font-semibold leading-[1.04] tracking-tight text-ink"
        >
          {{ recipe.title }}
        </h1>
        <p v-if="recipe.description" class="mt-3.5 text-[17px] leading-relaxed text-ink-soft">
          {{ recipe.description }}
        </p>
      </div>

      <!-- Hero -->
      <div
        :data-reveal="revealAttr"
        class="relative mb-[18px] aspect-video overflow-hidden rounded-[22px] border border-line shadow-[0_20px_44px_-28px_rgba(90,50,20,0.4)] print:max-h-[240px] print:rounded-lg print:border-0 print:shadow-none"
      >
        <NuxtImg
          v-if="recipe.hero_image"
          :src="recipe.hero_image"
          :alt="recipe.title"
          class="absolute inset-0 h-full w-full object-cover"
          sizes="(max-width: 1000px) 100vw, 1000px"
          format="webp"
          preload
        />
        <RecipePlaceholder v-else :label="`${recipe.cuisine ?? 'Recipe'} · hero photo`" />
      </div>

      <!-- Meta strip -->
      <MetaStrip :recipe="recipe" :data-reveal="revealAttr" />

      <!-- Actions (screen only) -->
      <div
        data-noprint
        :data-reveal="revealAttr"
        class="my-[34px] flex flex-wrap gap-2.5 print:hidden"
      >
        <button
          v-press
          type="button"
          class="inline-flex items-center gap-2 rounded-[13px] bg-clay px-[22px] py-3.5 text-[15.5px] font-semibold text-[#FFF7EF] shadow-clay transition hover:bg-clay-deep"
          @click="cookOpen = true"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 3c1.5 2.5 4 3.5 4 6.5a4 4 0 0 1-8 0C8 7 10.5 5.5 12 3z" />
            <path d="M6 14a6 6 0 0 0 12 0" />
          </svg>
          Cook mode
        </button>
        <button
          v-press
          type="button"
          class="inline-flex items-center gap-2 rounded-[13px] border border-line bg-paper px-5 py-3.5 text-[15.5px] font-semibold text-ink transition hover:border-[#D9CCB6] hover:bg-cream"
          @click="printRecipe"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M6 9V3h12v6" />
            <rect x="6" y="13" width="12" height="8" />
            <path d="M6 17H3v-6h18v6h-3" />
          </svg>
          Print recipe
        </button>
      </div>

      <!-- Body: ingredients + method. flex-wrap basis → two columns that stack on mobile. -->
      <div class="flex flex-wrap items-start gap-[34px]">
        <IngredientList :ingredients="recipe.recipe_ingredients" :data-reveal="revealAttr" />

        <section :data-reveal="revealAttr" class="min-w-0 flex-[2.4_1_440px]">
          <h2 class="mb-5 font-display text-[24px] font-semibold text-ink">Method</h2>
          <MethodSteps :steps="recipe.instructions" />
          <VideoEmbed v-if="recipe.youtube_url" :url="recipe.youtube_url" :title="recipe.title" />
        </section>
      </div>
    </article>

    <CookMode
      v-if="recipe"
      v-model:open="cookOpen"
      :title="recipe.title"
      :steps="recipe.instructions"
      :ingredients="recipe.recipe_ingredients"
    />
  </main>
</template>

<script setup lang="ts">
import type { RecipeWithIngredients } from '~/types/recipe'

const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data: recipe, error } = await useRecipe(slug)

// Surface fetch failures (500) and unknown slugs (404) as the proper error page.
if (error.value) throw error.value
if (!recipe.value) {
  throw createError({ statusCode: 404, statusMessage: 'Recipe not found', fatal: true })
}

const cookOpen = ref(false)

function printRecipe() {
  if (import.meta.client) window.print()
}

// --- Entrance (Phase 6): sequenced reveal, initial hard load only ------------
// hero → meta → actions → ingredients → method ease in top-to-bottom. On client-side
// navigation the built-in page transition handles the change instead, so we only mark +
// animate when this is the first (server-hydrated) render (see useInitialLoad).
const articleEl = ref<HTMLElement | null>(null)
const initialLoad = useInitialLoad()
const revealAttr = initialLoad ? '' : undefined

onMounted(() => {
  if (!initialLoad || !articleEl.value) return
  const targets = Array.from(articleEl.value.querySelectorAll<HTMLElement>('[data-reveal]'))
  revealSequence(targets)
})

// --- SEO ---------------------------------------------------------------------
useSeoMeta({
  title: () => (recipe.value ? `${recipe.value.title} · Flip's Kitchen` : "Flip's Kitchen"),
  description: () => recipe.value?.description ?? undefined,
  ogTitle: () => recipe.value?.title,
  ogDescription: () => recipe.value?.description ?? undefined,
  ogType: 'article',
  ogImage: () => recipe.value?.hero_image ?? undefined,
})

// --- schema.org/Recipe JSON-LD for rich results ------------------------------
function buildRecipeJsonLd(r: RecipeWithIngredients) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: r.title,
    ...(r.description ? { description: r.description } : {}),
    ...(r.hero_image ? { image: [r.hero_image] } : {}),
    ...(r.cuisine ? { recipeCuisine: r.cuisine } : {}),
    ...(r.servings != null ? { recipeYield: `${r.servings} servings` } : {}),
    ...(isoDuration(r.prep_minutes) ? { prepTime: isoDuration(r.prep_minutes) } : {}),
    ...(isoDuration(r.cook_minutes) ? { cookTime: isoDuration(r.cook_minutes) } : {}),
    ...(() => {
      const total = isoDuration(totalMinutes(r.prep_minutes, r.cook_minutes))
      return total ? { totalTime: total } : {}
    })(),
    ...(r.tags.length ? { keywords: r.tags.join(', ') } : {}),
    recipeIngredient: r.recipe_ingredients.map((i) =>
      [formatAmount(i.quantity, i.unit), i.name].filter(Boolean).join(' '),
    ),
    recipeInstructions: r.instructions.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: s.text,
    })),
  }
}

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() =>
        recipe.value ? JSON.stringify(buildRecipeJsonLd(recipe.value)) : '',
      ),
    },
  ],
})
</script>
