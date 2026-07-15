<template>
  <div v-if="videoId" data-noprint class="mt-9 print:hidden">
    <h2 class="mb-4 font-display text-[24px] font-semibold text-ink">Watch how it's made</h2>
    <!--
      <lite-youtube> is a Web Component (registered in app/plugins/lite-youtube.client.ts
      and told to Vue via nuxt.config `vue.compilerOptions.isCustomElement`). It renders a
      poster + play button and only loads the real iframe on click — fast, and no third-party
      JS until the visitor opts in. The inline background-image is the poster.
    -->
    <lite-youtube
      :videoid="videoId"
      :playlabel="`Play: ${title}`"
      :style="{ backgroundImage: `url('https://i.ytimg.com/vi/${videoId}/hqdefault.jpg')` }"
      class="block overflow-hidden rounded-[18px] border border-line"
    >
      <a
        :href="`https://www.youtube.com/watch?v=${videoId}`"
        target="_blank"
        rel="noopener"
        class="lite-youtube-fallback"
      >
        Watch “{{ title }}” on YouTube
      </a>
    </lite-youtube>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ url: string; title: string }>()

// Null when the URL isn't a recognizable YouTube link → the whole block is hidden.
const videoId = computed(() => youtubeId(props.url))
</script>
