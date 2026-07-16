<template>
  <div
    ref="gridEl"
    class="grid gap-[22px] grid-cols-[repeat(auto-fill,minmax(min(100%,250px),1fr))]"
    :data-entering="showEnterMarker ? '' : undefined"
  >
    <RecipeCard v-for="recipe in recipes" :key="recipe.id" :recipe="recipe" />
  </div>
</template>

<script setup lang="ts">
import type { RecipeCardData } from '~/types/recipe'

// Responsive card grid — one auto-fill/minmax track list, no breakpoints (per the
// design). Reflows from 1 to N columns on its own.
defineProps<{ recipes: RecipeCardData[] }>()

// --- Entrance (Phase 6) ------------------------------------------------------
// Stagger the cards in ONCE, on the initial hard load only. The grid is re-rendered on
// every keystroke / chip toggle (Phase 4 client filtering), so we must NOT re-run the
// stagger then: the animation lives in onMounted (fires once per mount), and filter
// changes only patch the card list — they never remount the grid.
//
// `data-entering` marks the grid so CSS can hide the cards before paint (see main.css).
// It's rendered only while we're about to animate, and dropped when the entrance COMPLETES
// (each card already holds anime's final inline opacity by then, so removing the marker
// can't flash — and cards added by later filtering are no longer caught by the hide rule).
const gridEl = ref<HTMLElement | null>(null)
const initialLoad = useInitialLoad()
const entered = ref(false)
const showEnterMarker = computed(() => initialLoad && !entered.value)

onMounted(() => {
  // Gate on initialLoad: only the first hard load staggers. A later remount (e.g. the
  // results ↔ no-results v-if toggle while filtering) must NOT re-stagger — and doesn't
  // carry the marker either (showEnterMarker is false once initialLoad is), so its cards
  // just render in place.
  const anim =
    initialLoad && gridEl.value
      ? staggerChildrenIn(gridEl.value, { onDone: () => (entered.value = true) })
      : undefined
  // Reduced motion / no cards / non-initial mount: nothing fires onDone, and the marker is
  // inert anyway (`.js-motion` isn't added under reduced motion) — so just drop it now.
  if (!anim) entered.value = true
})
</script>
