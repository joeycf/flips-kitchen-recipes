<template>
  <div class="relative">
    <input
      :value="model"
      type="text"
      autocomplete="off"
      placeholder="Start typing a cuisine…"
      aria-label="Cuisine"
      class="w-full rounded-field border border-line bg-[#FFFDFA] py-3 pl-3.5 pr-9 text-[15px] text-ink outline-none transition focus:border-clay focus:shadow-[0_0_0_3px_rgba(188,90,57,0.1)]"
      @input="onInput"
      @focus="open = true"
      @blur="onBlur"
      @keydown.escape="open = false"
    />
    <span class="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 text-ink-faint">
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
        <path d="M6 9l6 6 6-6" />
      </svg>
    </span>

    <div
      v-if="open"
      class="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-[236px] overflow-y-auto rounded-[12px] border border-line bg-cream p-1.5 shadow-[0_22px_44px_-18px_rgba(90,50,20,0.4)]"
    >
      <button
        v-for="c in matches"
        :key="c"
        type="button"
        class="flex w-full items-center justify-between gap-2 rounded-[8px] px-2.5 py-2.5 text-left text-[14px] font-medium text-ink transition hover:bg-clay-tint"
        :class="c === model ? 'bg-[#F9EEE6]' : 'bg-transparent'"
        @mousedown.prevent="pick(c)"
      >
        {{ c }}
        <svg
          v-if="c === model"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#BC5A39"
          stroke-width="2.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12l4.5 4.5L19 7" />
        </svg>
      </button>

      <p v-if="empty" class="px-2.5 py-2.5 text-[13px] leading-relaxed text-ink-faint">
        No match — this will be saved as a custom cuisine.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Searchable cuisine picker over CUISINES (utils/cuisines.ts). Free text: the current
// value is check-marked when it matches an option, and anything typed that matches
// nothing is kept and saved as a custom cuisine. Mirrors the design's autocomplete.
const model = defineModel<string>({ required: true })

const open = ref(false)

const query = computed(() => model.value.trim().toLowerCase())
const exact = computed(() => CUISINES.some((c) => c.toLowerCase() === query.value))
// Empty box or an exact hit → show the full list; otherwise narrow by substring.
const matches = computed(() =>
  !query.value || exact.value
    ? CUISINES
    : CUISINES.filter((c) => c.toLowerCase().includes(query.value)),
)
const empty = computed(() => matches.value.length === 0 && query.value.length > 0)

function onInput(event: Event) {
  model.value = (event.target as HTMLInputElement).value
  open.value = true
}

function pick(cuisine: string) {
  model.value = cuisine
  open.value = false
}

// Delay close so a click on an option (which blurs the input first) still registers.
function onBlur() {
  setTimeout(() => (open.value = false), 120)
}
</script>
