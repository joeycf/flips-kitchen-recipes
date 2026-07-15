<template>
  <div class="grid gap-[22px] grid-cols-[repeat(auto-fill,minmax(min(100%,250px),1fr))]">
    <RecipeCard v-for="recipe in recipes" :key="recipe.id" :recipe="recipe" />
  </div>
</template>

<script setup lang="ts">
import type { RecipeCardData } from '~/types/recipe'

// Responsive card grid — one auto-fill/minmax track list, no breakpoints (per the
// design). Reflows from 1 to N columns on its own.
defineProps<{ recipes: RecipeCardData[] }>()
</script>
