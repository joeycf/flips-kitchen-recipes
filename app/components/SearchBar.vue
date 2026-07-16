<template>
  <div class="relative">
    <span class="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 text-ink-faint">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.5" y2="16.5" />
      </svg>
    </span>
    <input
      v-model="model"
      type="search"
      :placeholder="placeholder"
      aria-label="Search recipes, ingredients and cuisines"
      class="w-full rounded-[14px] border border-line bg-paper py-3.5 pl-[46px] pr-4 text-[16px] text-ink outline-none transition focus:border-clay focus:shadow-[0_0_0_3px_rgba(188,90,57,0.12)]"
    />
  </div>
</template>

<script setup lang="ts">
const model = defineModel<string>({ required: true })

withDefaults(defineProps<{ placeholder?: string }>(), {
  placeholder: 'Search recipes, ingredients, cuisines…',
})
</script>
