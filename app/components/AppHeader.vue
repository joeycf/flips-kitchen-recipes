<template>
  <header
    data-noprint
    class="sticky top-0 z-40 border-b border-line bg-cream/85 backdrop-blur-md print:hidden"
  >
    <div class="mx-auto flex max-w-shell items-center justify-between gap-4 px-6 py-3">
      <NuxtLink to="/" class="flex items-center gap-3">
        <span
          class="flex h-9 w-9 items-center justify-center rounded-field bg-clay font-display text-xl font-semibold text-[#FFF7EF] shadow-clay"
        >
          J
        </span>
        <span class="flex flex-col items-start leading-none">
          <span class="font-display text-[18px] font-semibold tracking-tight text-ink">
            Flip's Kitchen
          </span>
          <span class="mt-[3px] font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
            Family recipes
          </span>
        </span>
      </NuxtLink>

      <div class="flex items-center gap-2.5">
        <NuxtLink
          v-if="!isHome"
          to="/"
          class="inline-flex items-center gap-1.5 rounded-field border border-line bg-paper px-3.5 py-2 text-[13.5px] font-semibold text-ink transition hover:border-[#D9CCB6] hover:bg-cream"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          All recipes
        </NuxtLink>

        <!-- Admin entry points, shown only to the signed-in owner. Client-only so the
             signed-out HTML stays cacheable (these pages are ISR-shared by all visitors). -->
        <ClientOnly>
          <template v-if="user">
            <NuxtLink
              to="/admin"
              class="inline-flex items-center gap-1.5 rounded-field border border-line bg-paper px-3.5 py-2 text-[13.5px] font-semibold text-ink transition hover:border-[#D9CCB6] hover:bg-cream"
            >
              Admin
            </NuxtLink>
            <NuxtLink
              to="/admin/new"
              class="inline-flex items-center gap-1.5 rounded-field bg-clay px-4 py-2.5 text-[13.5px] font-semibold text-[#FFF7EF] transition hover:bg-clay-deep"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New recipe
            </NuxtLink>
          </template>
        </ClientOnly>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
const isHome = computed(() => route.path === '/')

// Reveals the admin links for the signed-in owner (rendered client-only in the template).
const user = useSupabaseUser()
</script>
