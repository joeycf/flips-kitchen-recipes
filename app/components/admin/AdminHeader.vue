<template>
  <header class="sticky top-0 z-40 border-b border-line bg-cream/85 backdrop-blur-md">
    <div class="mx-auto flex max-w-shell items-center justify-between gap-4 px-6 py-3">
      <NuxtLink to="/admin" class="flex items-center gap-3">
        <span
          class="flex h-9 w-9 items-center justify-center rounded-field bg-clay font-display text-xl font-semibold text-[#FFF7EF] shadow-clay"
        >
          J
        </span>
        <span class="flex flex-col items-start leading-none">
          <span class="font-display text-[18px] font-semibold tracking-tight text-ink">
            Flip's Kitchen
          </span>
          <span class="mt-[3px] font-mono text-[9.5px] uppercase tracking-[0.14em] text-clay">
            Admin
          </span>
        </span>
      </NuxtLink>

      <div class="flex items-center gap-2.5">
        <NuxtLink
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
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          View site
        </NuxtLink>
        <button
          type="button"
          :disabled="signingOut"
          class="inline-flex items-center gap-1.5 rounded-field border border-line bg-paper px-3.5 py-2 text-[13.5px] font-semibold text-ink-soft transition hover:border-[#D9CCB6] hover:bg-cream disabled:opacity-60"
          @click="onSignOut"
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
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          Log out
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const signingOut = ref(false)

async function onSignOut() {
  if (signingOut.value) return
  signingOut.value = true
  await supabase.auth.signOut()
  await navigateTo('/')
}
</script>
