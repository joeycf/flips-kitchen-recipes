<template>
  <div class="flex items-center gap-2">
    <div class="flex gap-[3px]">
      <span
        v-for="i in 5"
        :key="i"
        class="rounded-full"
        :style="{
          width: `${size}px`,
          height: `${size}px`,
          background: i <= level ? 'var(--color-clay)' : '#E4D9C6',
        }"
      />
    </div>
    <span v-if="label" class="text-[11.5px] font-medium text-ink-faint">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
// Five-dot difficulty meter — first `level` dots filled clay. Pair with difficultyMeta()
// to turn the free-text `difficulty` column into a level + label.
withDefaults(defineProps<{ level: number; label?: string; size?: number }>(), {
  label: undefined,
  size: 6,
})
</script>
