<template>
  <div
    class="group relative h-full w-full overflow-hidden rounded-[inherit]"
    @dragover.prevent="dragOver = true"
    @dragleave.prevent="dragOver = false"
    @drop.prevent="onDrop"
  >
    <!-- Preview (uploaded URL, or the local file while it uploads) -->
    <template v-if="previewSrc">
      <img :src="previewSrc" :alt="label" class="absolute inset-0 h-full w-full object-cover" />
      <div
        v-if="uploading"
        class="absolute inset-0 flex items-center justify-center bg-ink/45 text-[12px] font-medium text-[#FBF6EC]"
      >
        Uploading…
      </div>
      <button
        v-else
        type="button"
        aria-label="Remove image"
        class="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink/70 text-[#FBF6EC] transition hover:bg-ink"
        @click="remove"
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
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      </button>
    </template>

    <!-- Empty dropzone -->
    <button
      v-else
      type="button"
      class="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center transition"
      :class="dragOver ? 'bg-clay-tint text-clay' : 'bg-[#FFFDFA] text-ink-faint hover:bg-cream'"
      @click="picker?.click()"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <span class="text-[12px] font-medium leading-snug">{{ placeholder }}</span>
    </button>

    <p
      v-if="errorMessage"
      class="absolute inset-x-2 bottom-2 rounded-[8px] bg-clay-deep/90 px-2 py-1 text-center text-[11px] font-medium text-[#FBF6EC]"
    >
      {{ errorMessage }}
    </p>

    <input ref="picker" type="file" accept="image/*" class="hidden" @change="onPick" />
  </div>
</template>

<script setup lang="ts">
// One image slot: click or drop to upload. Shows a local preview immediately, uploads to
// Supabase Storage (downscaled first), then swaps in the returned public URL. Used for
// both the hero (16:9) and each gallery cell (square) — the aspect ratio comes from the
// parent, this fills it.
const props = withDefaults(
  defineProps<{
    // Folder hint for the object path — the recipe's working slug (from its title).
    slugHint: string
    label?: string
    placeholder?: string
  }>(),
  { label: 'Recipe image', placeholder: 'Drop or click to upload' },
)

// The stored public URL (null when empty).
const model = defineModel<string | null>({ required: true })

const { uploadImage } = useRecipeAdmin()

const picker = useTemplateRef<HTMLInputElement>('picker')
const uploading = ref(false)
const dragOver = ref(false)
const errorMessage = ref('')
const localPreview = ref<string | null>(null)

const previewSrc = computed(() => model.value ?? localPreview.value)

function onPick(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) upload(file)
  // Reset so picking the same file again re-fires change.
  if (picker.value) picker.value.value = ''
}

function onDrop(event: DragEvent) {
  dragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) upload(file)
}

async function upload(file: File) {
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Please choose an image file.'
    return
  }
  errorMessage.value = ''
  clearLocalPreview()
  localPreview.value = URL.createObjectURL(file)
  uploading.value = true
  try {
    model.value = await uploadImage(file, props.slugHint)
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Upload failed.'
  } finally {
    uploading.value = false
    clearLocalPreview()
  }
}

function remove() {
  model.value = null
  clearLocalPreview()
  errorMessage.value = ''
}

function clearLocalPreview() {
  if (localPreview.value) {
    URL.revokeObjectURL(localPreview.value)
    localPreview.value = null
  }
}

onBeforeUnmount(clearLocalPreview)
</script>
