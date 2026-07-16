<template>
  <Transition name="flash">
    <div
      v-if="flash"
      role="status"
      class="fixed bottom-6 left-1/2 z-[80] inline-flex -translate-x-1/2 items-center gap-2 rounded-[12px] px-5 py-3 text-[14px] font-medium shadow-[0_16px_40px_-12px_rgba(0,0,0,0.4)]"
      :class="flash.tone === 'error' ? 'bg-clay-deep text-[#FBF6EC]' : 'bg-ink text-[#FBF6EC]'"
    >
      <svg
        v-if="flash.tone === 'success'"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#E8A57E"
        stroke-width="2.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M5 12l4.5 4.5L19 7" />
      </svg>
      <svg
        v-else
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#F3C6B4"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5" />
        <path d="M12 16h.01" />
      </svg>
      {{ flash.message }}
    </div>
  </Transition>
</template>

<script setup lang="ts">
// Renders the transient admin toast (bottom-center pill from the design). State comes
// from useAdminFlash so a message survives the save → redirect navigation.
const { flash } = useAdminFlash()
</script>

<style scoped>
.flash-enter-active,
.flash-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.flash-enter-from,
.flash-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}
</style>
