<template>
  <aside
    class="flex-[1_1_280px] rounded-card border border-line bg-paper p-6 shadow-[0_1px_2px_rgba(60,40,20,0.03)]"
  >
    <div class="mb-3 flex items-baseline justify-between">
      <h2 class="font-display text-[22px] font-semibold text-ink">Ingredients</h2>
      <span class="text-[12px] font-medium text-ink-faint">{{ ingredients.length }} items</span>
    </div>

    <div class="flex flex-col">
      <button
        v-for="ing in ingredients"
        :key="ing.id"
        type="button"
        :aria-pressed="checked.has(ing.id)"
        class="flex w-full items-start gap-3 border-b border-[#F0E7D7] py-[11px] text-left last:border-b-0"
        @click="toggle(ing.id)"
      >
        <span
          class="mt-px flex h-[22px] w-[22px] flex-none items-center justify-center rounded-[7px] border-[1.5px] transition"
          :class="checked.has(ing.id) ? 'border-clay bg-clay text-white' : 'border-line text-transparent'"
        >
          <svg
            v-show="checked.has(ing.id)"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M5 12l4.5 4.5L19 7" />
          </svg>
        </span>
        <span class="flex flex-1 gap-2.5">
          <span
            v-if="amount(ing)"
            class="min-w-[56px] text-[13.5px] font-semibold text-clay"
          >
            {{ amount(ing) }}
          </span>
          <span
            class="text-[15px] leading-snug"
            :class="checked.has(ing.id) ? 'text-ink-faint line-through' : 'text-ink'"
          >
            {{ ing.name }}
          </span>
        </span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { RecipeIngredient } from '~/types/recipe'

defineProps<{ ingredients: RecipeIngredient[] }>()

// "Check off as you shop/cook" state — local and ephemeral, keyed by ingredient id.
const checked = reactive(new Set<string>())
function toggle(id: string) {
  if (checked.has(id)) checked.delete(id)
  else checked.add(id)
}

function amount(ing: RecipeIngredient) {
  return formatAmount(ing.quantity, ing.unit)
}
</script>
