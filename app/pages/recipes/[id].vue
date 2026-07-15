<template>
  <main class="relative z-10 mx-auto max-w-read px-6 pb-24 pt-10">
    <NuxtLink
      to="/"
      class="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-clay"
    >
      ← All recipes
    </NuxtLink>

    <h1 class="mt-5 font-display text-[clamp(28px,4vw,40px)] font-semibold tracking-tight text-ink">
      {{ title }}
    </h1>
    <p class="mt-3 max-w-[62ch] leading-relaxed text-ink-soft">
      Recipe detail scaffold. This route (<code class="font-mono text-clay-deep">/recipes/**</code>)
      is served with ISR on Vercel.
    </p>
  </main>
</template>

<script setup lang="ts">
const route = useRoute()
const title = computed(() =>
  String(route.params.id)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()),
)
useHead({ title: () => `${title.value} · Flip's Kitchen` })
</script>
