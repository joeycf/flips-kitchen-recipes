import type { Ref } from 'vue'

// Native HTML5 drag-and-drop reordering for the admin form's ingredient and step lists
// (matches the design's drag ⠿ handles). Operates directly on a ref to the list, splicing
// the dragged item into its new slot on drop. Desktop-first, like the design — the owner
// manages recipes at a desk; touch devices simply won't drag.
export function useSortable<T>(list: Ref<T[]>) {
  const dragIndex = ref<number | null>(null)
  const overIndex = ref<number | null>(null)

  function onDragStart(index: number, event: DragEvent) {
    dragIndex.value = index
    overIndex.value = index
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      // Some browsers won't start a drag without payload; the value itself is unused.
      try {
        event.dataTransfer.setData('text/plain', String(index))
      } catch {
        /* Safari can throw here — safe to ignore. */
      }
    }
  }

  function onDragOver(index: number, event: DragEvent) {
    event.preventDefault() // allow the drop
    if (dragIndex.value !== null && overIndex.value !== index) overIndex.value = index
  }

  function onDrop(index: number, event: DragEvent) {
    event.preventDefault()
    const from = dragIndex.value
    if (from !== null && from !== index) {
      const next = [...list.value]
      const [moved] = next.splice(from, 1)
      next.splice(index, 0, moved as T)
      list.value = next
    }
    reset()
  }

  function reset() {
    dragIndex.value = null
    overIndex.value = null
  }

  /** Visual state for row `index` — used to dim the dragged row and highlight the target. */
  function rowState(index: number) {
    return {
      dragging: dragIndex.value === index,
      over: dragIndex.value !== null && overIndex.value === index && dragIndex.value !== index,
    }
  }

  return { onDragStart, onDragOver, onDrop, onDragEnd: reset, rowState }
}
