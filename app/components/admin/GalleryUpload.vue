<template>
  <div class="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
    <div
      v-for="(url, index) in model"
      :key="url"
      class="aspect-square overflow-hidden rounded-[14px] border border-dashed border-[#D9CCB6]"
    >
      <ImageUpload
        :model-value="url"
        :slug-hint="slugHint"
        label="Gallery image"
        placeholder="+ photo"
        @update:model-value="(value: string | null) => updateAt(index, value)"
      />
    </div>

    <!-- Trailing empty slot to add the next photo; keyed by count so it resets after add. -->
    <div
      :key="`add-${model.length}`"
      class="aspect-square overflow-hidden rounded-[14px] border border-dashed border-[#D9CCB6]"
    >
      <ImageUpload
        :model-value="null"
        :slug-hint="slugHint"
        label="Add gallery image"
        placeholder="+ photo"
        @update:model-value="onAdd"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// A growable grid of gallery images. Each stored URL is one slot (removing it compacts the
// list); a trailing empty slot uploads and appends the next photo.
// Explicit import — see the note in RecipeForm.vue about components/admin/ path prefixing.
import ImageUpload from '~/components/admin/ImageUpload.vue'

defineProps<{ slugHint: string }>()

const model = defineModel<string[]>({ required: true })

function updateAt(index: number, value: string | null) {
  if (value === null) {
    model.value = model.value.filter((_, i) => i !== index)
  } else {
    model.value = model.value.map((url, i) => (i === index ? value : url))
  }
}

function onAdd(value: string | null) {
  if (value) model.value = [...model.value, value]
}
</script>
