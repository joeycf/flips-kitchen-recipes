import { animate } from 'animejs'

/**
 * `v-press` — a restrained tactile press for buttons and filter chips.
 *
 * Hover and colour states stay in CSS; this only adds the one thing CSS can't do nicely:
 * a spring that dips on press and overshoots back on release. It's a progressive
 * enhancement — the directive's hooks run on the client only (SSR renders the element
 * untouched), and it self-disables under prefers-reduced-motion.
 *
 * Registered app-wide (universal plugin) so the directive resolves during SSR without a
 * warning; the actual work happens in the client-only `mounted`/`beforeUnmount` hooks.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const reduced = () =>
    import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  interface PressState {
    down: () => void
    up: () => void
  }
  const handlers = new WeakMap<HTMLElement, PressState>()

  nuxtApp.vueApp.directive<HTMLElement>('press', {
    mounted(el) {
      const down = () => {
        if (reduced()) return
        // Kill CSS transitions on the element so they don't lag anime's per-frame writes.
        el.style.transition = 'none'
        animate(el, { scale: 0.96, duration: 120, ease: 'out(2)' })
      }
      const up = () => {
        if (reduced()) return
        animate(el, {
          scale: 1,
          duration: 380,
          ease: 'outBack',
          // Hand transitions back to CSS; a leftover identity transform is harmless.
          onComplete: () => {
            el.style.transition = ''
          },
        })
      }

      el.addEventListener('pointerdown', down)
      el.addEventListener('pointerup', up)
      el.addEventListener('pointerleave', up)
      el.addEventListener('pointercancel', up)
      handlers.set(el, { down, up })
    },
    beforeUnmount(el) {
      const h = handlers.get(el)
      if (!h) return
      el.removeEventListener('pointerdown', h.down)
      el.removeEventListener('pointerup', h.up)
      el.removeEventListener('pointerleave', h.up)
      el.removeEventListener('pointercancel', h.up)
      handlers.delete(el)
    },
  })
})
