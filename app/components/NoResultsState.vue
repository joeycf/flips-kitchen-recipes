<template>
  <div class="mx-auto max-w-[440px] px-6 py-[70px] text-center">
    <div
      class="mx-auto mb-[22px] flex h-[74px] w-[74px] items-center justify-center rounded-[22px] bg-[#F1E8D8]"
    >
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#B9A98F"
        stroke-width="2"
        stroke-linecap="round"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.5" y2="16.5" />
      </svg>
    </div>
    <h2 class="font-display text-[24px] font-semibold text-ink">Nothing matches that search</h2>
    <p class="mt-2.5 text-[15px] leading-relaxed text-ink-soft">
      Try a different ingredient or clear the filters to see the whole collection.
    </p>
    <button
      type="button"
      class="mt-6 inline-flex items-center gap-2 rounded-xl border border-line bg-paper px-5 py-3 text-[15px] font-semibold text-ink transition hover:border-[#D9CCB6] hover:bg-cream"
      @click="$emit('clear')"
    >
      Clear filters
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ clear: [] }>()
</script>
