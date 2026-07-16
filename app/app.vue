<template>
  <div class="relative min-h-screen overflow-x-hidden">
    <!-- Subtle paper grain overlay, per the design reference (fixed, non-interactive). -->
    <div
      aria-hidden="true"
      data-noprint
      class="pointer-events-none fixed inset-0 z-0 opacity-[0.055] mix-blend-multiply print:hidden"
      :style="grain"
    />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const grain = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
}

// --- Site-wide SEO defaults ---------------------------------------------------
// Pages layer their own title/description/OG on top; these are the fallbacks and the
// shared bits (title template, canonical, default social image).
const route = useRoute()
const toAbsolute = useAbsoluteUrl()
const canonical = computed(() => toAbsolute(route.path))
const defaultOgImage = toAbsolute('/og-default.png')

useHead(() => ({
  // "<page> · Flip's Kitchen"; a page with no title falls back to the brand home title.
  titleTemplate: (title) => (title ? `${title} · Flip's Kitchen` : "Flip's Kitchen · Family recipes"),
  // Self-referential canonical from the production origin (query params dropped), so the
  // filtered home URLs (?q=&tags=) all consolidate to "/".
  link: [{ rel: 'canonical', href: canonical.value }],
}))

useSeoMeta({
  description:
    'Family recipes we cook on repeat — Filipino, Thai and Japanese dishes worth writing down and passing on.',
  ogSiteName: "Flip's Kitchen",
  ogType: 'website',
  ogUrl: () => canonical.value,
  ogImage: defaultOgImage,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: 'image/png',
  ogImageAlt: "Flip's Kitchen — family recipes",
  twitterCard: 'summary_large_image',
})
</script>
