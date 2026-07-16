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

// Phase 6 motion priming. Runs inline in <head> on the client BEFORE first paint, so the
// entrance start-states (see main.css `html.js-motion …`) hide their targets ahead of the
// JS-driven reveal — no flash of SSR content appearing then hiding on hydration. It's a
// progressive enhancement: skipped entirely under reduced motion, and never added without
// JS, so content stays visible in both cases. The load-time failsafe (3s after load, long
// past any entrance) both drops the class AND clears any inline opacity/transform anime may
// have left on a target — so content can never get stuck hidden, even if the animation was
// interrupted (e.g. a backgrounded tab) before it finished.
const MOTION_PRIME_SCRIPT = `(function(){try{var m=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)');if(m&&m.matches)return;var r=document.documentElement;r.classList.add('js-motion');window.addEventListener('load',function(){setTimeout(function(){r.classList.remove('js-motion');var e=document.querySelectorAll('[data-entering] > *,[data-reveal]');for(var i=0;i<e.length;i++){e[i].style.opacity='';e[i].style.transform='';}},3000)})}catch(e){}})()`

// Nuxt 4 config — https://nuxt.com/docs/api/nuxt-config
export default defineNuxtConfig({
  // Pin framework behaviour to a recent date.
  compatibilityDate: '2026-07-15',

  devtools: { enabled: true },

  modules: [
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/eslint',
    '@nuxtjs/supabase',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    // Vercel Web Analytics — injects the tracking script and reports page views. Only
    // active on the deployed site; a no-op locally (VERCEL_* env absent).
    '@vercel/analytics/nuxt',
  ],

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

  // Production origin for absolute SEO URLs (canonical, OG/Twitter images). Bound to the
  // NUXT_PUBLIC_SITE_URL env var at runtime; when unset (local dev / an un-configured
  // preview), app code falls back to the request origin. Set it in Vercel after the first
  // deploy (docs/PLAYBOOK Phase 7B).
  runtimeConfig: {
    public: {
      siteUrl: '',
    },
  },

  // Consumed by @nuxtjs/sitemap + @nuxtjs/robots (via nuxt-site-config) to emit absolute
  // <loc>s and the robots.txt `Sitemap:` line. Reads the same env var as siteUrl above at
  // build time; falls back to the deploy URL the modules detect when it's absent.
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL,
    name: "Flip's Kitchen",
  },

  // sitemap.xml — static pages are auto-discovered; recipe detail routes come from the
  // dynamic source (server/api/__sitemap__/urls.ts, which pulls slugs from Supabase).
  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    exclude: ['/admin/**', '/login'],
  },

  // robots.txt — allow indexing, keep the admin area out of the index. @nuxtjs/robots
  // appends the `Sitemap:` directive automatically using the site URL above, and honors
  // the `robots: false` route rules below (X-Robots-Tag: noindex on the private routes).
  robots: {
    disallow: ['/admin'],
  },

  // Self-hosted fonts (@nuxt/fonts) — downloads Spectral / Work Sans / JetBrains Mono at
  // build time and serves them locally with size-adjusted fallback metrics, removing the
  // runtime Google Fonts request and the layout shift it caused. Weights mirror the former
  // <link> (italic dropped — the design doesn't use it). Names come from the @theme font
  // tokens in main.css, which resolve to these families via var(--font-*).
  fonts: {
    families: [
      { name: 'Spectral', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'Work Sans', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 500, 600] },
    ],
  },

  // Tailwind CSS v4 is wired in as a Vite plugin (no tailwind.config.js — the
  // theme lives in app/assets/css/main.css via @theme).
  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    // Subtle built-in fade/slide for list ↔ detail route changes. anime.js handles the
    // in-page choreography (which only runs on the initial hard load), so the two never
    // double-animate. Disabled for print + reduced motion in main.css.
    pageTransition: { name: 'page', mode: 'out-in' },

    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        // Tints mobile browser chrome to match the cream header, for a seamless top edge.
        { name: 'theme-color', content: '#faf4ea' },
        // Stop iOS Safari auto-linking numbers (e.g. servings, minutes) as phone numbers.
        { name: 'format-detection', content: 'telephone=no' },
      ],
      script: [
        {
          innerHTML: MOTION_PRIME_SCRIPT,
          // Emit early in <head> and run before body paint (no defer/async).
          tagPosition: 'head',
          tagPriority: 'critical',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        // Spectral / Work Sans / JetBrains Mono are now self-hosted via @nuxt/fonts (see
        // the `fonts` config above) — no external stylesheet or preconnect needed.
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
    // Private, client-rendered admin area — never prerendered, and kept out of search
    // indexes (`robots: false` → X-Robots-Tag: noindex, via @nuxtjs/robots).
    '/admin/**': { ssr: false, prerender: false, robots: false },
    // Public but not worth indexing (owner-only sign-in).
    '/login': { robots: false },
  },
})
