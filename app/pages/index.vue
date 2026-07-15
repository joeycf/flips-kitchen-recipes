<template>
  <main class="relative z-10 mx-auto max-w-shell px-6 pb-24 pt-10">
    <header class="max-w-[640px]">
      <p class="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-clay">
        Filipino · Thai · Japanese
      </p>
      <h1
        class="mt-3 font-display text-[clamp(30px,5.5vw,46px)] font-semibold leading-[1.04] tracking-tight text-ink"
      >
        Recipes from our family table
      </h1>
      <p class="mt-3 text-base leading-relaxed text-ink-soft">
        A little collection of the dishes we cook on repeat that are worth writing down and passing
        on.
      </p>
    </header>

    <div class="mt-8 flex flex-wrap gap-3">
      <NuxtLink
        to="/recipes/chicken-adobo"
        class="inline-flex items-center gap-2 rounded-field bg-clay px-4 py-2.5 font-semibold text-[#fff7ef] shadow-clay transition hover:bg-clay-deep"
      >
        Browse a recipe
      </NuxtLink>
      <NuxtLink
        to="/admin"
        class="inline-flex items-center gap-2 rounded-field border border-line bg-paper px-4 py-2.5 font-semibold text-ink transition hover:bg-cream"
      >
        Admin
      </NuxtLink>
    </div>

    <p class="mt-10 font-mono text-xs text-ink-faint">
      Scaffold ready · home &amp; /recipes/** render with ISR · /admin is client-rendered.
    </p>
  </main>
</template>

<script setup lang="ts">
useHead({ title: "Flip's Kitchen — family recipes" })
</script>
