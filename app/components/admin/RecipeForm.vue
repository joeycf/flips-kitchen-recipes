<template>
  <form class="flex flex-col gap-[18px]" novalidate @submit.prevent="onSubmit">
    <!-- Core details -->
    <section class="rounded-card border border-line bg-cream p-6">
      <div class="mb-[18px]">
        <label
          :for="ids.title"
          class="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint"
        >
          Title
        </label>
        <input
          :id="ids.title"
          v-model="title"
          type="text"
          placeholder="e.g. Chicken Adobo"
          class="w-full rounded-field border border-line bg-[#FFFDFA] px-3.5 py-3 text-[15px] text-ink outline-none transition focus:border-clay focus:shadow-[0_0_0_3px_rgba(188,90,57,0.1)]"
        />
      </div>

      <div class="mb-[18px]">
        <label
          :for="ids.description"
          class="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint"
        >
          Description
        </label>
        <textarea
          :id="ids.description"
          v-model="description"
          rows="2"
          placeholder="A short, appetizing line about the dish…"
          class="w-full resize-y rounded-field border border-line bg-[#FFFDFA] px-3.5 py-3 text-[15px] leading-relaxed text-ink outline-none transition focus:border-clay focus:shadow-[0_0_0_3px_rgba(188,90,57,0.1)]"
        />
      </div>

      <div class="mb-[18px] flex flex-wrap gap-[22px]">
        <div class="min-w-[240px] flex-1">
          <span
            class="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint"
          >
            Cuisine
          </span>
          <CuisineSelect v-model="cuisine" />
        </div>
        <div class="flex-1 basis-[180px]">
          <span
            :id="ids.difficulty"
            class="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint"
          >
            Difficulty
          </span>
          <div
            class="flex items-center gap-2.5 py-1.5"
            role="group"
            :aria-labelledby="ids.difficulty"
          >
            <button
              v-for="n in 5"
              :key="n"
              type="button"
              :aria-label="`Set difficulty ${n}`"
              :aria-pressed="n <= difficultyLevel"
              class="h-[22px] w-[22px] rounded-full transition"
              :style="{ background: n <= difficultyLevel ? 'var(--color-clay)' : '#E4D9C6' }"
              @click="setDifficulty(n)"
            />
            <span class="ml-1 text-[12px] font-medium text-ink-faint">{{ difficultyLabel }}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div>
          <label
            :for="ids.servings"
            class="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint"
          >
            Servings
          </label>
          <input
            :id="ids.servings"
            v-model="servings"
            type="number"
            min="1"
            placeholder="4"
            class="w-full rounded-field border border-line bg-[#FFFDFA] px-3.5 py-3 text-[15px] text-ink outline-none transition focus:border-clay"
          />
        </div>
        <div>
          <label
            :for="ids.prep"
            class="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint"
          >
            Prep (min)
          </label>
          <input
            :id="ids.prep"
            v-model="prep"
            type="number"
            min="0"
            placeholder="15"
            class="w-full rounded-field border border-line bg-[#FFFDFA] px-3.5 py-3 text-[15px] text-ink outline-none transition focus:border-clay"
          />
        </div>
        <div>
          <label
            :for="ids.cook"
            class="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint"
          >
            Cook (min)
          </label>
          <input
            :id="ids.cook"
            v-model="cook"
            type="number"
            min="0"
            placeholder="45"
            class="w-full rounded-field border border-line bg-[#FFFDFA] px-3.5 py-3 text-[15px] text-ink outline-none transition focus:border-clay"
          />
        </div>
      </div>

      <div class="mt-[18px]">
        <span
          class="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint"
        >
          Tags
        </span>
        <TagsInput v-model="tags" />
      </div>

      <div class="mt-[18px]">
        <label
          :for="ids.youtube"
          class="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint"
        >
          YouTube URL <span class="normal-case tracking-normal text-ink-faint">(optional)</span>
        </label>
        <input
          :id="ids.youtube"
          v-model="youtube"
          type="url"
          inputmode="url"
          placeholder="https://youtube.com/watch?v=…"
          class="w-full rounded-field border border-line bg-[#FFFDFA] px-3.5 py-3 text-[15px] text-ink outline-none transition focus:border-clay"
        />
      </div>
    </section>

    <!-- Hero image -->
    <section class="rounded-card border border-line bg-cream p-6">
      <h2 class="mb-1 font-display text-[20px] font-semibold text-ink">Hero image</h2>
      <p class="mb-3.5 text-[13px] text-ink-faint">
        Drag a photo in, or click to browse. This is the big image at the top of the recipe.
      </p>
      <div
        class="aspect-video overflow-hidden rounded-[16px] border border-dashed border-[#D9CCB6]"
      >
        <ImageUpload
          v-model="heroImage"
          :slug-hint="slugHint"
          label="Hero image"
          placeholder="Drop or click to upload hero image"
        />
      </div>
    </section>

    <!-- Gallery -->
    <section class="rounded-card border border-line bg-cream p-6">
      <h2 class="mb-1 font-display text-[20px] font-semibold text-ink">Gallery</h2>
      <p class="mb-3.5 text-[13px] text-ink-faint">
        Extra shots — plating, closeups, the finished spread.
      </p>
      <GalleryUpload v-model="gallery" :slug-hint="slugHint" />
    </section>

    <!-- Ingredients -->
    <section class="rounded-card border border-line bg-cream p-6">
      <div class="mb-1 flex items-baseline justify-between">
        <h2 class="font-display text-[20px] font-semibold text-ink">Ingredients</h2>
        <span class="font-mono text-[11.5px] font-medium text-ink-faint">drag ⠿ to reorder</span>
      </div>
      <p class="mb-4 text-[13px] text-ink-faint">Quantity · unit · name.</p>
      <IngredientRows v-model="ingredients" />
    </section>

    <!-- Instructions -->
    <section class="rounded-card border border-line bg-cream p-6">
      <div class="mb-4 flex items-baseline justify-between">
        <h2 class="font-display text-[20px] font-semibold text-ink">Instructions</h2>
        <span class="font-mono text-[11.5px] font-medium text-ink-faint">drag ⠿ to reorder</span>
      </div>
      <StepRows v-model="steps" />
    </section>

    <!-- Error + actions -->
    <p
      v-if="errorMessage || serverError"
      role="alert"
      class="rounded-field border border-[#E4C0B0] bg-[#FBEAE1] px-3.5 py-2.5 text-[13.5px] text-clay-deep"
    >
      {{ errorMessage || serverError }}
    </p>

    <div class="flex justify-end gap-3">
      <button
        type="button"
        class="rounded-[12px] border border-line bg-cream px-6 py-3.5 text-[15px] font-semibold text-ink-soft transition hover:border-[#D9CCB6] hover:bg-[#FBF6EC]"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="submitting"
        class="inline-flex items-center gap-2 rounded-[12px] bg-clay px-7 py-3.5 text-[15px] font-semibold text-[#FFF7EF] shadow-clay transition hover:bg-clay-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg
          v-if="!submitting"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12l4.5 4.5L19 7" />
        </svg>
        {{ submitting ? 'Saving…' : submitLabel }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
// Explicit imports (not auto-import): these live in components/admin/, which Nuxt would
// otherwise register under an "Admin*" path prefix — so the bare <CuisineSelect> etc. tags
// wouldn't resolve and would silently render nothing. Importing them makes a wrong
// reference a build error instead of a blank subtree.
import CuisineSelect from '~/components/admin/CuisineSelect.vue'
import TagsInput from '~/components/admin/TagsInput.vue'
import IngredientRows from '~/components/admin/IngredientRows.vue'
import StepRows from '~/components/admin/StepRows.vue'
import ImageUpload from '~/components/admin/ImageUpload.vue'
import GalleryUpload from '~/components/admin/GalleryUpload.vue'
import type { IngredientDraft, RecipeFormPayload, StepDraft } from '~/types/admin'
import type { RecipeWithIngredients } from '~/types/recipe'

const props = withDefaults(
  defineProps<{
    initial?: RecipeWithIngredients | null
    submitting?: boolean
    serverError?: string | null
    submitLabel?: string
  }>(),
  { initial: null, submitting: false, serverError: null, submitLabel: 'Save recipe' },
)

const emit = defineEmits<{ submit: [payload: RecipeFormPayload]; cancel: [] }>()

// Unique field ids so labels bind correctly even if the form ever renders twice.
const uid = useId()
const ids = {
  title: `${uid}-title`,
  description: `${uid}-description`,
  servings: `${uid}-servings`,
  prep: `${uid}-prep`,
  cook: `${uid}-cook`,
  difficulty: `${uid}-difficulty`,
  youtube: `${uid}-youtube`,
}

// --- Reactive form state (numbers kept as strings while editing) ------------
const title = ref('')
const description = ref('')
const cuisine = ref('')
const difficultyLevel = ref(3)
const servings = ref('')
const prep = ref('')
const cook = ref('')
const youtube = ref('')
const tags = ref<string[]>([])
const heroImage = ref<string | null>(null)
const gallery = ref<string[]>([])
const ingredients = ref<IngredientDraft[]>([blankIngredient()])
const steps = ref<StepDraft[]>([blankStep()])
const errorMessage = ref('')

// Object-path folder for uploads: prefer the stable existing slug (edit), else the title.
const slugHint = computed(() => props.initial?.slug || title.value || 'untitled')
const difficultyLabel = computed(() => difficultyForLevel(difficultyLevel.value) ?? 'Not set')

function blankIngredient(): IngredientDraft {
  return { id: crypto.randomUUID(), qty: '', unit: '', name: '' }
}
function blankStep(): StepDraft {
  return { id: crypto.randomUUID(), text: '' }
}

// Seed from an existing recipe when editing (immediate covers the mounted-with-data case).
watch(
  () => props.initial,
  (recipe) => {
    if (!recipe) return
    title.value = recipe.title
    description.value = recipe.description ?? ''
    cuisine.value = recipe.cuisine ?? ''
    difficultyLevel.value = difficultyMeta(recipe.difficulty).level
    servings.value = recipe.servings != null ? String(recipe.servings) : ''
    prep.value = recipe.prep_minutes != null ? String(recipe.prep_minutes) : ''
    cook.value = recipe.cook_minutes != null ? String(recipe.cook_minutes) : ''
    youtube.value = recipe.youtube_url ?? ''
    tags.value = [...recipe.tags]
    heroImage.value = recipe.hero_image
    gallery.value = [...recipe.gallery]
    ingredients.value = recipe.recipe_ingredients.length
      ? recipe.recipe_ingredients.map((i) => ({
          id: crypto.randomUUID(),
          qty: i.quantity != null ? formatQuantity(i.quantity) : '',
          unit: i.unit ?? '',
          name: i.name,
        }))
      : [blankIngredient()]
    steps.value = recipe.instructions.length
      ? recipe.instructions.map((s) => ({
          id: crypto.randomUUID(),
          text: s.text,
          image: s.image ?? null,
        }))
      : [blankStep()]
  },
  { immediate: true },
)

function setDifficulty(n: number) {
  // Click the current level again to clear it (stores no difficulty).
  difficultyLevel.value = difficultyLevel.value === n ? 0 : n
}

// --- Normalize + emit -------------------------------------------------------
// A `<input type="number">` binds a *number* through v-model (not the string the ref was
// typed as), so these must accept either and coerce — passing a number to `.trim()` was
// what crashed the save.
const nullIfBlank = (value: string | number | null | undefined): string | null => {
  const text = String(value ?? '').trim()
  return text ? text : null
}
const toIntOrNull = (value: string | number | null | undefined): number | null => {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : parseInt(value, 10)
  return Number.isFinite(n) ? Math.trunc(n) : null
}

function onSubmit() {
  errorMessage.value = ''
  if (!title.value.trim()) {
    errorMessage.value = 'Please add a title before saving.'
    return
  }

  const payload: RecipeFormPayload = {
    title: title.value.trim(),
    description: nullIfBlank(description.value),
    cuisine: nullIfBlank(cuisine.value),
    hero_image: heroImage.value,
    gallery: gallery.value,
    youtube_url: nullIfBlank(youtube.value),
    prep_minutes: toIntOrNull(prep.value),
    cook_minutes: toIntOrNull(cook.value),
    servings: toIntOrNull(servings.value),
    difficulty: difficultyForLevel(difficultyLevel.value),
    tags: tags.value.map((t) => t.trim()).filter(Boolean),
    // Drop empty steps; keep any per-step image already attached.
    instructions: steps.value
      .map((s) => {
        const text = s.text.trim()
        return s.image ? { text, image: s.image } : { text }
      })
      .filter((s) => s.text),
    // Drop nameless rows; renumber positions; derive name_key (lowercased name).
    ingredients: ingredients.value
      .filter((i) => i.name.trim())
      .map((i, index) => ({
        position: index,
        quantity: parseQuantity(i.qty),
        unit: nullIfBlank(i.unit),
        name: i.name.trim(),
        name_key: i.name.trim().toLowerCase() || null,
      })),
  }
  emit('submit', payload)
}
</script>
