<template>
  <div class="flex flex-wrap gap-2.5">
    <div
      v-for="tile in tiles"
      :key="tile.label"
      class="flex min-w-[100px] flex-[1_1_108px] flex-col gap-[5px] rounded-[14px] border border-line bg-paper px-4 py-[13px]"
    >
      <span class="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
        {{ tile.label }}
      </span>
      <DifficultyDots
        v-if="tile.difficulty"
        :level="tile.difficulty.level"
        :label="tile.difficulty.label"
        :size="7"
      />
      <span v-else class="font-display text-[17px] font-semibold text-ink">{{ tile.value }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Recipe } from '~/types/recipe'
import type { DifficultyMeta } from '~/utils/recipe'

const props = defineProps<{
  recipe: Pick<Recipe, 'prep_minutes' | 'cook_minutes' | 'servings' | 'difficulty'>
}>()

interface Tile {
  label: string
  value?: string
  difficulty?: DifficultyMeta
}

// Only render tiles we actually have data for, so a recipe missing (say) a cook time
// doesn't show an empty "Cook" card.
const tiles = computed<Tile[]>(() => {
  const { prep_minutes, cook_minutes, servings, difficulty } = props.recipe
  const total = totalMinutes(prep_minutes, cook_minutes)
  const diff = difficultyMeta(difficulty)

  const out: Tile[] = []
  if (prep_minutes != null) out.push({ label: 'Prep', value: `${prep_minutes} min` })
  if (cook_minutes != null) out.push({ label: 'Cook', value: `${cook_minutes} min` })
  if (total != null) out.push({ label: 'Total', value: `${total} min` })
  if (servings != null) out.push({ label: 'Serves', value: String(servings) })
  if (diff.level) out.push({ label: 'Difficulty', difficulty: diff })
  return out
})
</script>
