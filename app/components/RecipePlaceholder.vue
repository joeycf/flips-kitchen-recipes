<template>
  <div class="absolute inset-0 flex items-end p-3" :style="stripes">
    <span
      v-if="label"
      class="rounded-md bg-paper/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.07em] text-ink-faint"
    >
      {{ label }}
    </span>
  </div>
</template>

<script setup lang="ts">
// Stand-in for a missing photo — the design's warm "kraft paper" diagonal stripes.
// Fills its (relatively positioned) parent; the parent owns the aspect ratio.
defineProps<{ label?: string }>()

const stripes = {
  backgroundColor: '#EFE6D6',
  backgroundImage: 'repeating-linear-gradient(135deg, #EBE1CF 0 13px, #F2E9D9 13px 26px)',
}
</script>
