<template>
  <div role="status">
    <span class="sr-only">Loading recipe…</span>
    <div aria-hidden="true" class="flex flex-col gap-[18px]">
      <!-- Core details card -->
      <section class="rounded-card border border-line bg-cream p-6">
        <div class="skeleton h-2.5 w-14 rounded" />
        <div class="skeleton mt-2.5 h-11 w-full rounded-field" />
        <div class="skeleton mt-5 h-2.5 w-24 rounded" />
        <div class="skeleton mt-2.5 h-[68px] w-full rounded-field" />
        <div class="mt-5 flex flex-wrap gap-[22px]">
          <div class="min-w-[240px] flex-1">
            <div class="skeleton h-2.5 w-16 rounded" />
            <div class="skeleton mt-2.5 h-11 w-full rounded-field" />
          </div>
          <div class="flex-1 basis-[180px]">
            <div class="skeleton h-2.5 w-16 rounded" />
            <div class="skeleton mt-2.5 h-11 w-full rounded-field" />
          </div>
        </div>
      </section>

      <!-- Hero image card -->
      <section class="rounded-card border border-line bg-cream p-6">
        <div class="skeleton h-4 w-28 rounded" />
        <div class="skeleton mt-4 aspect-video w-full rounded-[16px]" />
      </section>

      <!-- Ingredients / steps card -->
      <section class="rounded-card border border-line bg-cream p-6">
        <div class="skeleton h-4 w-32 rounded" />
        <div class="skeleton mt-4 h-12 w-full rounded-[12px]" />
        <div class="skeleton mt-2.5 h-12 w-full rounded-[12px]" />
        <div class="skeleton mt-2.5 h-12 w-full rounded-[12px]" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
// Placeholder for the edit form while it loads the recipe being edited (useAsyncData,
// client-side). Approximates the real form's stacked section cards. Shared `.skeleton`
// pulse; stilled under reduced motion.
</script>
