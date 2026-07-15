<template>
  <main class="relative z-10 mx-auto max-w-shell px-6 pb-24 pt-10">
    <p class="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-clay">Admin</p>
    <h1 class="mt-3 font-display text-[clamp(28px,4vw,40px)] font-semibold tracking-tight text-ink">
      Recipe admin
    </h1>
    <p class="mt-3 max-w-[62ch] leading-relaxed text-ink-soft">
      This section is client-rendered (<code class="font-mono text-clay-deep">ssr: false</code>) and
      is never prerendered.
    </p>
    <p class="mt-6 font-mono text-xs text-ink-faint">Rendered on the client at {{ renderedAt }}</p>
  </main>
</template>

<script setup lang="ts">
// Proof this section is client-only: the timestamp is set after mount, in the browser.
const renderedAt = ref('…')
onMounted(() => {
  renderedAt.value = new Date().toLocaleTimeString()
})
useHead({ title: "Admin · Flip's Kitchen" })
</script>
