<template>
  <Teleport to="body">
    <div
      v-if="open"
      role="dialog"
      aria-modal="true"
      :aria-label="`Cook mode: ${title}`"
      class="fixed inset-0 z-[60] flex flex-col bg-[#FBF6EC]"
    >
      <!-- Top bar: exit · title · Steps/Checklist toggle -->
      <div class="flex flex-none items-center justify-between gap-3 border-b border-line px-5 py-[15px]">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-field border border-line bg-paper px-3.5 py-2 text-[13.5px] font-semibold text-ink transition hover:border-[#D9CCB6]"
          @click="close"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
          Exit
        </button>
        <div class="min-w-0 flex-1 text-center">
          <div class="truncate font-display text-[15px] font-semibold text-ink">{{ title }}</div>
          <div class="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
            Cook mode<span v-if="isActive"> · screen stays on</span>
          </div>
        </div>
        <div class="inline-flex flex-none gap-0.5 rounded-[10px] border border-line bg-[#F1E8D8] p-[3px]">
          <button type="button" :class="segClass('steps')" @click="mode = 'steps'">Steps</button>
          <button type="button" :class="segClass('checklist')" @click="mode = 'checklist'">
            Checklist
          </button>
        </div>
      </div>

      <!-- STEPS: one big step at a time -->
      <div v-if="mode === 'steps'" class="flex min-h-0 flex-1 flex-col">
        <div class="h-[5px] flex-none bg-[#EFE6D6]">
          <div class="h-full bg-clay transition-[width] duration-300" :style="{ width: progressPct }" />
        </div>

        <div
          class="mx-auto flex w-full max-w-[900px] flex-1 flex-col items-center justify-center px-6 py-8 text-center"
        >
          <div class="mb-6 font-mono text-[13px] font-semibold uppercase tracking-[0.14em] text-clay">
            Step {{ current + 1 }} of {{ total }}
          </div>
          <p
            class="m-0 max-w-[17ch] text-pretty font-display text-[clamp(28px,4.6vw,46px)] font-medium leading-[1.28] text-ink"
          >
            {{ currentStep?.text }}
          </p>
        </div>

        <!-- Ingredients at a glance, horizontally scrollable -->
        <div
          v-if="ingredients.length"
          class="flex flex-none gap-2 overflow-x-auto border-t border-[#EFE6D6] px-5 py-3"
        >
          <span
            v-for="ing in ingredients"
            :key="ing.id"
            class="flex-none whitespace-nowrap rounded-pill bg-[#F1E8D8] px-3 py-1.5 text-[12.5px] font-medium text-ink-soft"
          >
            <b v-if="amount(ing)" class="text-clay">{{ amount(ing) }} </b>{{ ing.name }}
          </span>
        </div>

        <!-- Oversized nav (≥56px tall tap targets) -->
        <div class="mx-auto flex w-full max-w-[900px] gap-3 px-6 pt-[18px] pb-[calc(18px+env(safe-area-inset-bottom))]">
          <button
            type="button"
            :disabled="current === 0"
            class="flex-1 rounded-[14px] border border-line bg-paper p-[18px] text-[16px] font-semibold text-ink transition enabled:hover:bg-[#FBF6EC] disabled:opacity-40"
            @click="prev"
          >
            Back
          </button>
          <button
            type="button"
            class="flex-[2] rounded-[14px] bg-clay p-[18px] text-[16px] font-semibold text-[#FFF7EF] transition hover:bg-clay-deep"
            @click="isLast ? close() : next()"
          >
            {{ isLast ? 'Done' : 'Next step →' }}
          </button>
        </div>
      </div>

      <!-- CHECKLIST: tick steps off in any order -->
      <div v-else class="flex-1 overflow-auto px-6 py-6">
        <div class="mx-auto flex max-w-[760px] flex-col gap-3.5">
          <button
            v-for="(step, i) in steps"
            :key="i"
            type="button"
            :aria-pressed="done.has(i)"
            class="flex w-full items-start gap-[18px] rounded-[16px] border border-line bg-paper px-6 py-[22px] text-left"
            @click="toggleDone(i)"
          >
            <span
              class="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] border-2 transition"
              :class="done.has(i) ? 'border-clay bg-clay text-white' : 'border-line text-transparent'"
            >
              <svg
                v-show="done.has(i)"
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M5 12l4.5 4.5L19 7" />
              </svg>
            </span>
            <span
              class="flex-1 text-[clamp(18px,2.5vw,23px)] font-medium leading-[1.4]"
              :class="done.has(i) ? 'text-ink-faint line-through' : 'text-ink'"
            >
              <b class="mr-2 font-display text-clay">{{ i + 1 }}.</b>{{ step.text }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { InstructionStep, RecipeIngredient } from '~/types/recipe'

const props = defineProps<{
  title: string
  steps: InstructionStep[]
  ingredients: RecipeIngredient[]
}>()

// Two-way open state, so the parent can also close (e.g. on route change).
const open = defineModel<boolean>('open', { required: true })

// Keeps the screen awake while cooking; degrades to a no-op where unsupported.
const { isActive, request, release } = useWakeLock()

type Mode = 'steps' | 'checklist'
const mode = ref<Mode>('steps')
const current = ref(0)
const done = reactive(new Set<number>())

const total = computed(() => props.steps.length)
const currentStep = computed(() => props.steps[current.value])
const isLast = computed(() => current.value >= total.value - 1)
const progressPct = computed(() =>
  total.value ? `${((current.value + 1) / total.value) * 100}%` : '0%',
)

function next() {
  if (current.value < total.value - 1) current.value++
}
function prev() {
  if (current.value > 0) current.value--
}
function close() {
  open.value = false
}
function toggleDone(i: number) {
  if (done.has(i)) done.delete(i)
  else done.add(i)
}
function amount(ing: RecipeIngredient) {
  return formatAmount(ing.quantity, ing.unit)
}
function segClass(m: Mode) {
  return [
    'rounded-[8px] px-3 py-[7px] text-[12.5px] font-semibold transition',
    mode.value === m ? 'bg-clay text-[#FFF7EF]' : 'bg-transparent text-ink-soft',
  ]
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    close()
    return
  }
  if (mode.value !== 'steps') return
  if (e.key === 'ArrowRight') next()
  else if (e.key === 'ArrowLeft') prev()
}

// Wire up (and tear down) the overlay's side effects as it opens/closes: wake lock,
// body scroll lock, and keyboard shortcuts.
watch(open, (isOpen) => {
  if (!import.meta.client) return
  if (isOpen) {
    mode.value = 'steps'
    current.value = 0
    done.clear()
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeydown)
    void request()
  } else {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onKeydown)
    void release()
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onKeydown)
  }
  void release()
})
</script>
