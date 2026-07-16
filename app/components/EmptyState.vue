<template>
  <div class="mx-auto max-w-[440px] px-6 py-[76px] text-center">
    <div
      class="mx-auto mb-[22px] flex h-[74px] w-[74px] items-center justify-center rounded-[22px] bg-clay-tint"
    >
      <!-- Simple "empty bowl" mark from the design. -->
      <div class="h-10 w-10 rounded-b-full border-[3px] border-t-0 border-clay" />
    </div>
    <h2 class="font-display text-[26px] font-semibold text-ink">No recipes yet</h2>
    <p class="mt-2.5 text-[15px] leading-relaxed text-ink-soft">
      Your kitchen's a blank slate. Add your first recipe and it'll show up right here in the
      collection.
    </p>
    <NuxtLink
      to="/admin"
      class="mt-6 inline-flex items-center gap-2 rounded-xl bg-clay px-[22px] py-[13px] text-[15px] font-semibold text-[#FFF7EF] transition hover:bg-clay-deep"
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      Add your first recipe
    </NuxtLink>
  </div>
</template>
