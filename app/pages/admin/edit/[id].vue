<template>
  <main class="relative z-10 mx-auto max-w-[820px] px-6 pb-[120px] pt-7">
    <div class="mb-6">
      <div class="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-clay">
        Admin
      </div>
      <h1
        class="mt-2 font-display text-[clamp(28px,4.5vw,40px)] font-semibold tracking-tight text-ink"
      >
        Edit recipe
      </h1>
    </div>

    <div
      v-if="pending"
      class="rounded-card border border-line bg-paper p-8 text-center text-ink-soft"
    >
      Loading recipe…
    </div>

    <div
      v-else-if="error || !recipe"
      class="rounded-card border border-line bg-paper p-8 text-center"
    >
      <p class="text-ink-soft">
        {{ error ? 'Couldn’t load this recipe.' : 'That recipe no longer exists.' }}
      </p>
      <NuxtLink to="/admin" class="mt-4 inline-block font-semibold text-clay hover:text-clay-deep">
        ← Back to recipes
      </NuxtLink>
    </div>

    <RecipeForm
      v-else
      :initial="recipe"
      :submitting="saving"
      :server-error="serverError"
      submit-label="Save changes"
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

const route = useRoute()
const id = computed(() => String(route.params.id))

const { loadForEdit, saveRecipe } = useRecipeAdmin()
const { notifySaved } = useAdminFlash()

// Not awaited, so the template can show its own pending/error/not-found states.
// `watch: [id]` refetches if the same component is reused for a different recipe.
const {
  data: recipe,
  pending,
  error,
} = useAsyncData(`admin:recipe:${id.value}`, () => loadForEdit(id.value), { watch: [id] })

const saving = ref(false)
const serverError = ref<string | null>(null)

async function onSave(payload: RecipeFormPayload) {
  if (!recipe.value) return
  saving.value = true
  serverError.value = null
  try {
    // Keep the existing slug so public links stay stable.
    await saveRecipe(payload, recipe.value.id, recipe.value.slug)
    notifySaved('Changes saved')
    refreshNuxtData('admin:recipes') // list picks up the edit on return
    await navigateTo('/admin')
  } catch (e) {
    serverError.value = e instanceof Error ? e.message : 'Could not save your changes.'
    saving.value = false
  }
}

function onCancel() {
  navigateTo('/admin')
}

useHead({ title: "Edit recipe · Admin · Flip's Kitchen" })
</script>
