<template>
  <main class="relative z-10 mx-auto max-w-[820px] px-6 pb-[120px] pt-7">
    <div class="mb-6">
      <div class="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-clay">
        Admin
      </div>
      <h1
        class="mt-2 font-display text-[clamp(28px,4.5vw,40px)] font-semibold tracking-tight text-ink"
      >
        New recipe
      </h1>
    </div>

    <RecipeForm
      :submitting="saving"
      :server-error="serverError"
      @submit="onSave"
      @cancel="onCancel"
    />
  </main>
</template>

<script setup lang="ts">
// Explicit import — components/admin/ is path-prefixed by Nuxt auto-import, so a bare
// <RecipeForm> tag wouldn't resolve (it would silently render nothing).
import RecipeForm from '~/components/admin/RecipeForm.vue'
import type { RecipeFormPayload } from '~/types/admin'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const { saveRecipe } = useRecipeAdmin()
const { notifySaved } = useAdminFlash()

const saving = ref(false)
const serverError = ref<string | null>(null)

async function onSave(payload: RecipeFormPayload) {
  saving.value = true
  serverError.value = null
  try {
    await saveRecipe(payload, null, null)
    notifySaved()
    refreshNuxtData('admin:recipes') // new recipe shows in the list on return
    await navigateTo('/admin') // leave `saving` true — we're navigating away
  } catch (e) {
    serverError.value = e instanceof Error ? e.message : 'Could not save the recipe.'
    saving.value = false
  }
}

function onCancel() {
  navigateTo('/admin')
}

useHead({ title: "New recipe · Admin · Flip's Kitchen" })
</script>
