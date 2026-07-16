<template>
  <main class="relative z-10 mx-auto max-w-shell px-6 pb-24 pt-8">
    <header class="mb-7 max-w-[640px]">
      <p class="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-clay">
        Filipino · Thai · Japanese
      </p>
      <h1
        class="mt-3 font-display text-[clamp(30px,5.5vw,46px)] font-semibold leading-[1.04] tracking-tight text-ink"
      >
        Recipes from our family table
      </h1>
      <p class="mt-3 text-base leading-relaxed text-ink-soft">
        A little collection of the dishes we cook on repeat that are worth writing down and passing
        on.
      </p>
    </header>

    <div v-if="error" class="rounded-card border border-line bg-paper p-8 text-center">
      <p class="text-ink-soft">Something went wrong loading the recipes. Please try again.</p>
    </div>

    <!-- Empty DB — distinct from the "no matches" state below. -->
    <EmptyState v-else-if="!recipes || recipes.length === 0" />

    <template v-else>
      <div class="mb-[18px]">
        <SearchBar v-model="search" />
      </div>

      <FilterChips
        v-model="selectedChips"
        :chips="chips"
        :has-active-filters="hasActiveFilters"
        @clear="clearFilters"
      />

      <p class="mb-4 text-[14px] text-[#8A7C6E]">
        <b class="font-semibold text-ink">{{ resultCount }}</b>
        {{ resultCount === 1 ? 'recipe' : 'recipes' }}
      </p>

      <NoResultsState v-if="showNoResults" @clear="clearFilters" />
      <RecipeGrid v-else :recipes="filtered" />
    </template>
  </main>
</template>

<script setup lang="ts">
const { data: recipes, error } = await useRecipes()

// Client-side fuzzy search + chip filtering over the loaded list, synced to the URL.
const { search, selectedChips, chips, filtered, resultCount, hasActiveFilters, showNoResults, clearFilters } =
  useRecipeSearch(recipes)

useSeoMeta({
  title: "Flip's Kitchen — family recipes",
  description:
    'A little collection of Filipino, Thai and Japanese dishes we cook on repeat — worth writing down and passing on.',
  ogTitle: "Flip's Kitchen — family recipes",
  ogDescription: 'Filipino, Thai and Japanese recipes from our family table.',
  ogType: 'website',
})
</script>
