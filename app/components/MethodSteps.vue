<template>
  <ol class="flex flex-col gap-[22px]">
    <li v-for="(step, i) in steps" :key="i" class="flex gap-4">
      <div
        class="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[12px] bg-clay-tint font-display text-[17px] font-semibold text-clay"
      >
        {{ i + 1 }}
      </div>
      <div class="min-w-0 flex-1 pt-[5px]">
        <p class="text-[16px] leading-[1.65] text-[#3A322B]">{{ step.text }}</p>
        <div
          v-if="step.image"
          class="relative mt-3 aspect-video max-w-[420px] overflow-hidden rounded-[14px] border border-line"
        >
          <NuxtImg
            :src="step.image"
            :alt="`Step ${i + 1}`"
            class="absolute inset-0 h-full w-full object-cover"
            sizes="(max-width: 640px) 100vw, 420px"
            format="webp"
            loading="lazy"
          />
        </div>
      </div>
    </li>
  </ol>
</template>

<script setup lang="ts">
import type { InstructionStep } from '~/types/recipe'

// Numbered method steps from the `instructions` jsonb. Semantic <ol> so the numbering
// survives with styles off (and prints cleanly).
defineProps<{ steps: InstructionStep[] }>()
</script>
