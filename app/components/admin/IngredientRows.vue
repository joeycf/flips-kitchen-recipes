<template>
  <div>
    <div class="flex flex-col gap-2">
      <div
        v-for="(row, index) in model"
        :key="row.id"
        class="flex items-center gap-2.5 rounded-[12px] border p-2 transition-[background-color,border-color,opacity]"
        :class="rowState(index).over ? 'border-clay bg-clay-tint' : 'border-line bg-cream'"
        :style="{ opacity: rowState(index).dragging ? 0.4 : 1 }"
        @dragover="onDragOver(index, $event)"
        @drop="onDrop(index, $event)"
      >
        <span
          class="flex flex-none cursor-grab px-1 py-1.5 text-ink-faint active:cursor-grabbing"
          draggable="true"
          aria-label="Drag to reorder"
          @dragstart="onDragStart(index, $event)"
          @dragend="onDragEnd"
        >
          <svg width="14" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="5" r="1.7" />
            <circle cx="15" cy="5" r="1.7" />
            <circle cx="9" cy="12" r="1.7" />
            <circle cx="15" cy="12" r="1.7" />
            <circle cx="9" cy="19" r="1.7" />
            <circle cx="15" cy="19" r="1.7" />
          </svg>
        </span>

        <input
          v-model="row.qty"
          type="text"
          inputmode="decimal"
          placeholder="1"
          aria-label="Quantity"
          class="w-[52px] flex-none rounded-[9px] border border-line bg-[#FFFDFA] px-2.5 py-2.5 text-[14px] text-ink outline-none transition focus:border-clay"
        />
        <input
          v-model="row.unit"
          type="text"
          placeholder="cup"
          aria-label="Unit"
          class="w-[74px] flex-none rounded-[9px] border border-line bg-[#FFFDFA] px-2.5 py-2.5 text-[14px] text-ink outline-none transition focus:border-clay"
        />
        <input
          v-model="row.name"
          type="text"
          placeholder="ingredient"
          aria-label="Ingredient name"
          class="min-w-0 flex-1 rounded-[9px] border border-line bg-[#FFFDFA] px-2.5 py-2.5 text-[14px] text-ink outline-none transition focus:border-clay"
        />

        <button
          type="button"
          aria-label="Remove ingredient"
          class="flex h-8 w-8 flex-none items-center justify-center rounded-[8px] text-ink-faint transition hover:bg-clay-tint hover:text-clay"
          @click="removeRow(index)"
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
        </button>
      </div>
    </div>

    <button
      type="button"
      class="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-[#D9BBA8] bg-transparent px-4 py-2.5 text-[13.5px] font-semibold text-clay transition hover:border-clay hover:bg-[#F9EEE6]"
      @click="addRow"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      Add ingredient
    </button>
  </div>
</template>

<script setup lang="ts">
import type { IngredientDraft } from '~/types/admin'

// Reorderable quantity / unit / name rows. Rows are edited in place (shared object refs);
// add / remove / drag-reorder reassign the array so the parent form stays in sync.
const model = defineModel<IngredientDraft[]>({ required: true })

const { onDragStart, onDragOver, onDrop, onDragEnd, rowState } = useSortable(model)

function newRow(): IngredientDraft {
  return { id: crypto.randomUUID(), qty: '', unit: '', name: '' }
}

function addRow() {
  model.value = [...model.value, newRow()]
}

function removeRow(index: number) {
  model.value = model.value.filter((_, i) => i !== index)
}
</script>
