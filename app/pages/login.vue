<template>
  <main class="relative z-10 mx-auto flex max-w-sheet flex-col items-center px-6 pb-24 pt-16">
    <div class="w-full max-w-[420px]">
      <div class="mb-7 text-center">
        <p class="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-clay">
          Admin
        </p>
        <h1
          class="mt-3 font-display text-[clamp(26px,4vw,34px)] font-semibold tracking-tight text-ink"
        >
          Sign in
        </h1>
        <p class="mt-2 text-[14px] leading-relaxed text-ink-soft">
          Sign in to add and edit recipes. This area is just for the family cook.
        </p>
      </div>

      <form
        class="rounded-card border border-line bg-paper p-6 shadow-card"
        novalidate
        @submit.prevent="onSubmit"
      >
        <div class="mb-4">
          <label
            for="email"
            class="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint"
          >
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            placeholder="you@example.com"
            class="w-full rounded-field border border-line bg-[#FFFDFA] px-3.5 py-3 text-[15px] text-ink outline-none transition focus:border-clay focus:shadow-[0_0_0_3px_rgba(188,90,57,0.1)]"
          />
        </div>

        <div class="mb-5">
          <label
            for="password"
            class="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint"
          >
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            placeholder="••••••••"
            class="w-full rounded-field border border-line bg-[#FFFDFA] px-3.5 py-3 text-[15px] text-ink outline-none transition focus:border-clay focus:shadow-[0_0_0_3px_rgba(188,90,57,0.1)]"
          />
        </div>

        <p
          v-if="errorMessage"
          role="alert"
          class="mb-4 rounded-field border border-[#E4C0B0] bg-[#FBEAE1] px-3.5 py-2.5 text-[13.5px] text-clay-deep"
        >
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          :disabled="submitting"
          class="inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-clay px-6 py-3.5 text-[15px] font-semibold text-[#FFF7EF] shadow-clay transition hover:bg-clay-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ submitting ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>
  </main>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()

const email = ref('')
const password = ref('')
const submitting = ref(false)
const errorMessage = ref('')

// Where to go after a successful sign-in — the page the middleware bounced us from,
// falling back to the admin home. Guard against open-redirects: only same-site paths.
const redirectTo = computed(() => {
  const target = route.query.redirect
  return typeof target === 'string' && target.startsWith('/') ? target : '/admin'
})

// Already signed in (or just became so) → skip the form.
watchEffect(() => {
  if (user.value) navigateTo(redirectTo.value)
})

async function onSubmit() {
  if (submitting.value) return
  errorMessage.value = ''
  submitting.value = true
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value.trim(),
    password: password.value,
  })
  submitting.value = false

  if (error) {
    errorMessage.value = 'That email and password didn’t match. Please try again.'
    password.value = ''
    return
  }
  // The watchEffect above navigates once the user ref updates.
}

useHead({ title: "Sign in · Flip's Kitchen" })
</script>
