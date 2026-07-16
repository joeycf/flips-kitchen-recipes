// Absolute-URL helpers for SEO (canonical links, OG/Twitter image URLs).
//
// The production origin comes from runtimeConfig.public.siteUrl, bound to the
// NUXT_PUBLIC_SITE_URL env var (set in Vercel — see docs/PLAYBOOK Phase 7B). When it's
// unset (local dev, or a preview before the env is configured) we fall back to the
// current request origin so canonical/OG URLs are still absolute and self-consistent.

/** The site origin, without a trailing slash, e.g. "https://flipskitchen.com". */
export function useSiteOrigin(): string {
  const configured = useRuntimeConfig().public.siteUrl
  const origin = configured || useRequestURL().origin
  return origin.replace(/\/+$/, '')
}

/** Returns a function that turns a root-relative path into an absolute URL. */
export function useAbsoluteUrl(): (path: string) => string {
  const origin = useSiteOrigin()
  return (path: string) => `${origin}${path.startsWith('/') ? path : `/${path}`}`
}
