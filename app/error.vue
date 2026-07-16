<template>
  <div class="relative flex min-h-screen flex-col overflow-x-hidden bg-cream">
    <!-- Same paper grain as the app shell, so the error page still feels like home. -->
    <div
      aria-hidden="true"
      class="pointer-events-none fixed inset-0 z-0 opacity-[0.055] mix-blend-multiply"
      :style="grain"
    />

    <main
      id="main-content"
      class="relative z-10 mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center justify-center px-6 py-20 text-center"
    >
      <span
        class="flex h-14 w-14 items-center justify-center rounded-field bg-clay font-display text-2xl font-semibold text-[#FFF7EF] shadow-clay"
      >
        J
      </span>

      <p class="mt-8 font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-clay">
        Error {{ statusCode }}
      </p>
      <h1
        class="mt-3 font-display text-[clamp(30px,6vw,46px)] font-semibold leading-[1.06] tracking-tight text-ink"
      >
        {{ heading }}
      </h1>
      <p class="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-ink-soft">
        {{ message }}
      </p>

      <div class="mt-9 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-[13px] bg-clay px-[22px] py-3.5 text-[15px] font-semibold text-[#FFF7EF] shadow-clay transition hover:bg-clay-deep"
          @click="goHome"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V21h14V9.5" />
          </svg>
          Back to the kitchen
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

// Nuxt renders this standalone (no layout) whenever a route throws — including the
// recipe detail page's createError(404). It hands us the error as a prop.
const props = defineProps<{ error: NuxtError }>()

const statusCode = computed(() => props.error?.statusCode ?? 500)
const isNotFound = computed(() => statusCode.value === 404)

const heading = computed(() =>
  isNotFound.value ? 'This recipe wandered off' : 'Something’s burning',
)
const message = computed(() =>
  isNotFound.value
    ? 'We couldn’t find the page you were after — it may have been moved or the link’s gone stale. Let’s get you back to the good stuff.'
    : 'An unexpected error cropped up on our end. Give it another try in a moment, or head back to the recipe collection.',
)

// clearError unmounts the error page; the redirect drops us back on the home route.
function goHome() {
  clearError({ redirect: '/' })
}

const grain = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
}

useHead({ title: computed(() => (isNotFound.value ? 'Page not found' : 'Something went wrong')) })
</script>
