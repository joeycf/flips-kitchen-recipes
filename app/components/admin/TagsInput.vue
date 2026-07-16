<template>
  <div>
    <div class="flex flex-wrap items-center gap-2">
      <span
        v-for="tag in model"
        :key="tag"
        class="inline-flex items-center gap-1.5 rounded-pill bg-[#F1E8D8] py-1.5 pl-3 pr-2 text-[13px] font-medium text-ink-soft"
      >
        {{ tag }}
        <button
          type="button"
          :aria-label="`Remove ${tag}`"
          class="flex p-px text-ink-faint transition hover:text-clay"
          @click="removeTag(tag)"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      </span>

      <input
        v-model="draft"
        type="text"
        placeholder="Add tag + Enter"
        aria-label="Add a tag"
        class="min-w-[130px] flex-1 rounded-[10px] border border-dashed border-[#D9CCB6] bg-transparent px-3 py-2.5 text-[14px] text-ink outline-none transition focus:border-solid focus:border-clay"
        @keydown.enter.prevent="addFromDraft"
        @keydown="onKeydown"
      />
    </div>

    <div v-if="availableSuggestions.length" class="mt-3 flex flex-wrap items-center gap-1.5">
      <span
        class="mr-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-faint"
      >
        Quick add
      </span>
      <button
        v-for="suggestion in availableSuggestions"
        :key="suggestion"
        type="button"
        class="inline-flex items-center gap-1 rounded-pill border border-line bg-paper px-2.5 py-1 text-[12.5px] font-medium text-ink-soft transition hover:border-clay hover:text-clay"
        @click="addTag(suggestion)"
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.6"
          stroke-linecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {{ suggestion }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Free-text tag entry (Enter or comma to commit) plus one-click "quick add" chips for the
// curated tag-driven filter terms — applying these makes the matching home-page filter
// chips light up (the ingredient-driven chips like Chicken/Rice match via ingredients
// instead, so they aren't suggested here). See useRecipeSearch → FILTER_CHIPS.
const SUGGESTED_TAGS = ['vegetarian', 'spicy', 'quick', 'seafood', 'noodles'] as const

const model = defineModel<string[]>({ required: true })
const draft = ref('')

const availableSuggestions = computed(() => {
  const applied = new Set(model.value.map((t) => t.toLowerCase()))
  return SUGGESTED_TAGS.filter((s) => !applied.has(s))
})

function addTag(raw: string) {
  const tag = raw.trim()
  if (!tag) return
  if (model.value.some((t) => t.toLowerCase() === tag.toLowerCase())) return
  model.value = [...model.value, tag]
}

function addFromDraft() {
  addTag(draft.value)
  draft.value = ''
}

function removeTag(tag: string) {
  model.value = model.value.filter((t) => t !== tag)
}

// Comma also commits a tag, matching common tag-input muscle memory.
function onKeydown(event: KeyboardEvent) {
  if (event.key === ',') {
    event.preventDefault()
    addFromDraft()
  }
}
</script>
