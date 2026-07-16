<template>
  <NuxtLink
    :to="`/recipes/${recipe.slug}`"
    class="group flex flex-col overflow-hidden rounded-card border border-line bg-paper text-left shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-lift"
  >
    <div class="relative aspect-[4/3]">
      <NuxtImg
        v-if="recipe.hero_image"
        :src="recipe.hero_image"
        :alt="recipe.title"
        class="absolute inset-0 h-full w-full object-cover"
        sizes="(max-width: 640px) 100vw, 320px"
        format="webp"
        loading="lazy"
      />
      <RecipePlaceholder v-else :label="`${recipe.cuisine ?? 'Recipe'} · photo`" />
    </div>

    <div class="flex flex-1 flex-col gap-2.5 p-4 pb-[18px]">
      <div class="flex items-center justify-between gap-2">
        <span
          v-if="recipe.cuisine"
          class="font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-clay"
        >
          {{ recipe.cuisine }}
        </span>
        <span
          v-if="total !== null"
          class="ml-auto inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-soft"
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
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          {{ total }} min
        </span>
      </div>

      <h3 class="font-display text-xl font-semibold leading-tight tracking-tight text-ink">
        {{ recipe.title }}
      </h3>

      <p v-if="recipe.description" class="line-clamp-2 text-[13.5px] leading-snug text-ink-soft">
        {{ recipe.description }}
      </p>

      <DifficultyDots
        v-if="difficulty.level"
        :level="difficulty.level"
        :label="difficulty.label"
        class="mt-auto pt-2"
      />

      <div
        v-if="recipe.tags.length"
        class="flex flex-nowrap items-center gap-1.5 overflow-hidden"
        :class="difficulty.level ? '' : 'mt-auto pt-2'"
      >
        <span
          v-for="tag in shownTags"
          :key="tag"
          class="flex-none rounded-pill bg-[#F1E8D8] px-2.5 py-1 text-[11px] font-medium text-ink-soft"
        >
          {{ tag }}
        </span>
        <span
          v-if="extraTags > 0"
          class="flex-none rounded-pill bg-clay-tint px-2.5 py-1 text-[11px] font-semibold text-clay-deep"
        >
          +{{ extraTags }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { RecipeCardData } from '~/types/recipe'

const props = defineProps<{ recipe: RecipeCardData }>()

const total = computed(() => totalMinutes(props.recipe.prep_minutes, props.recipe.cook_minutes))
const difficulty = computed(() => difficultyMeta(props.recipe.difficulty))

// Single-line tag row: show the first few, roll the rest into a "+N" chip (matches the
// design's overflow behaviour without measuring widths).
const MAX_TAGS = 3
const shownTags = computed(() => props.recipe.tags.slice(0, MAX_TAGS))
const extraTags = computed(() => Math.max(0, props.recipe.tags.length - MAX_TAGS))
</script>
