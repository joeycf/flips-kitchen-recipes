<template>
  <div class="mb-7 flex flex-wrap items-center gap-2.5">
    <span class="mr-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
      Filter
    </span>

    <button
      v-for="chip in chips"
      :key="chip"
      v-press
      type="button"
      :aria-pressed="isActive(chip)"
      :class="chipClass(chip)"
      @click="toggle(chip)"
    >
      {{ chip }}
    </button>

    <button
      v-if="hasActiveFilters"
      type="button"
      class="px-1.5 py-1 text-[12.5px] font-medium text-clay underline transition hover:text-clay-deep"
      @click="$emit('clear')"
    >
      Clear all
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ chips: readonly string[]; hasActiveFilters: boolean }>()
defineEmits<{ clear: [] }>()

const model = defineModel<string[]>({ required: true })

function isActive(chip: string) {
  return model.value.includes(chip)
}

function toggle(chip: string) {
  model.value = isActive(chip) ? model.value.filter((c) => c !== chip) : [...model.value, chip]
}

function chipClass(chip: string) {
  return [
    'rounded-pill border px-[15px] py-2 text-[13.5px] font-medium transition',
    isActive(chip)
      ? 'border-clay bg-clay text-[#FFF7EF]'
      : 'border-line bg-paper text-ink-soft hover:border-[#D9CCB6]',
  ]
}
</script>
