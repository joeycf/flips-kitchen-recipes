import tailwindcss from '@tailwindcss/vite'

// ISR revalidation window for the public pages (home + recipe detail). Also the freshness
// window for admin edits: a saved recipe becomes visible publicly within this many seconds.
const ISR_TTL_SECONDS = 60

// Derive the Supabase Storage host (e.g. "<ref>.supabase.co") from SUPABASE_URL so
// @nuxt/image is allowed to optimize remote hero photos. Nuxt loads .env before this
// file, so process.env.SUPABASE_URL is available here; guard so a missing/blank URL
// (e.g. a bare CI checkout) can't throw and break the build.
const supabaseImageDomains = (() => {
  try {
    return process.env.SUPABASE_URL ? [new URL(process.env.SUPABASE_URL).host] : []
  } catch {
    return []
  }
})()

// Nuxt 4 config — https://nuxt.com/docs/api/nuxt-config
export default defineNuxtConfig({
  // Pin framework behaviour to a recent date.
  compatibilityDate: '2026-07-15',

  devtools: { enabled: true },

  modules: ['@nuxt/image', '@nuxt/eslint', '@nuxtjs/supabase'],

  css: [
    '~/assets/css/main.css',
    // Facade styles for the click-to-load YouTube embed (registered in
    // app/plugins/lite-youtube.client.ts). Imported here so the poster/play-button
    // markup is styled during SSR, before the custom element upgrades on the client.
    'lite-youtube-embed/src/lite-yt-embed.css',
  ],

  // Optimize remote hero images served from Supabase Storage. Handled by the Vercel
  // image optimizer in production and IPX in dev; null hero_image uses <RecipePlaceholder>.
  image: {
    domains: supabaseImageDomains,
  },

  // <lite-youtube> is a Web Component (not a Vue component). Tell the Vue compiler to
  // leave the tag alone so it renders as a custom element instead of warning.
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'lite-youtube',
    },
  },

  // Supabase backend. URL + key are read from SUPABASE_URL / SUPABASE_KEY in
  // .env (see .env.example). `redirect: false` keeps the public site ungated; the
  // /admin section is protected by the `auth` route middleware instead (Phase 5).
  supabase: {
    redirect: false,
    types: '~/types/database.types.ts',
  },

  // Tailwind CSS v4 is wired in as a Vite plugin (no tailwind.config.js — the
  // theme lives in app/assets/css/main.css via @theme).
  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        // Fonts referenced by the design tokens (Spectral / Work Sans / JetBrains Mono).
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,500;0,600;0,700;1,500&family=Work+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap',
        },
      ],
    },
  },

  // Per-route rendering:
  //  - Public pages use time-based ISR: regenerated on Vercel and cached at the edge,
  //    revalidated at most once per ISR_TTL_SECONDS. This is the freshness window for
  //    admin edits — a saved recipe appears publicly within ~a minute (see docs/PLAYBOOK
  //    → Phase 5 "Freshness"). On-demand revalidation is a possible later upgrade.
  //  - /admin is a client-rendered SPA section and is never prerendered.
  routeRules: {
    '/': { isr: ISR_TTL_SECONDS },
    '/recipes/**': { isr: ISR_TTL_SECONDS },
    '/admin/**': { ssr: false, prerender: false },
  },
})
