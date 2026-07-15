import tailwindcss from '@tailwindcss/vite'

// Nuxt 4 config — https://nuxt.com/docs/api/nuxt-config
export default defineNuxtConfig({
  // Pin framework behaviour to a recent date.
  compatibilityDate: '2026-07-15',

  devtools: { enabled: true },

  modules: ['@nuxt/image', '@nuxt/eslint'],

  css: ['~/assets/css/main.css'],

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
  //  - Public pages use ISR (regenerated on Vercel, cached at the edge).
  //  - /admin is a client-rendered SPA section and is never prerendered.
  routeRules: {
    '/': { isr: true },
    '/recipes/**': { isr: true },
    '/admin/**': { ssr: false, prerender: false },
  },
})
