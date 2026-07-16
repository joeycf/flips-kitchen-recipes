<template>
  <div role="status">
    <span class="sr-only">Loading recipes…</span>
    <ul aria-hidden="true" class="flex flex-col gap-2.5">
      <li
        v-for="n in 4"
        :key="n"
        class="flex items-center gap-4 rounded-card border border-line bg-paper p-3 shadow-card"
      >
        <div class="skeleton h-16 w-16 flex-none rounded-[12px]" />
        <div class="min-w-0 flex-1">
          <div class="skeleton h-2.5 w-16 rounded" />
          <div class="skeleton mt-2.5 h-4 w-2/5 rounded" />
          <div class="skeleton mt-2 h-2.5 w-24 rounded" />
        </div>
        <div class="hidden flex-none items-center gap-2 sm:flex">
          <div class="skeleton h-9 w-16 rounded-field" />
          <div class="skeleton h-9 w-20 rounded-field" />
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// Placeholder for the /admin recipe list while it loads client-side (the admin section is
// ssr:false). Mirrors the real list item's layout so the swap-in doesn't jump. The pulse
// comes from the shared `.skeleton` class (stilled under reduced motion).
</script>
