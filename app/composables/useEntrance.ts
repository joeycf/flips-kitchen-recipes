import { animate, stagger } from 'animejs'
import type { JSAnimation } from 'animejs'

/**
 * anime.js v4 entrance choreography — the in-page motion layer (Phase 6).
 *
 * These helpers only run in the browser and only apply MOTION; the hidden *start*
 * state is applied ahead of paint by CSS (see `html.js-motion …` in main.css, primed
 * by the inline script in nuxt.config). That split is what makes the entrance a true
 * progressive enhancement: with no JS — or under reduced motion — the class is never
 * added, so content renders visible and these helpers no-op.
 */

const noop = () => {}

// prefers-reduced-motion, read on the client. On the server we can't know, so callers
// gate motion behind onMounted / import.meta.client and this stays a client-only check.
function prefersReducedMotion(): boolean {
  return import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * True only for the very first, server-hydrated page render — false for subsequent
 * client-side route navigations. In-page entrance choreography is gated on this so it
 * plays once on a hard load / shared link (when Nuxt runs no page transition), while
 * route changes are left to the built-in page transition. That keeps the two motion
 * systems from double-animating the same content.
 *
 * The server returns `true` so the SSR markup carries the entrance markers, matching
 * the first client render exactly (no hydration mismatch). `isHydrating` is `true`
 * throughout the initial page's setup and stays so until hydration resolves.
 */
export function useInitialLoad(): boolean {
  if (import.meta.server) return true
  return useNuxtApp().isHydrating === true
}

interface EntranceOptions {
  /** Distance (px) the target rises from. */
  y?: number
  /** Per-target tween duration (ms). */
  duration?: number
  /** Delay between successive targets (ms). 0 = all together. */
  stagger?: number
  /** Base delay before the first target (ms). */
  delay?: number
  /** Ran once the whole entrance has finished (after inline styles are cleared). */
  onDone?: () => void
}

/**
 * Shared fade + rise. The hidden start-state is NOT written inline here — it's held by the
 * CSS marker (`html.js-motion [data-entering|data-reveal]`) right up until anime's own
 * inline opacity takes over, so there's no flash AND nothing is left stuck hidden: removing
 * the `.js-motion` class (the load-time failsafe) always reveals the content. We only
 * suppress any CSS `transition` on the targets so it can't lag anime's per-frame writes,
 * then hand them back to CSS on completion (clearing the inline transform so e.g. the card
 * hover-lift keeps working; anime leaves the final opacity: 1 in place).
 */
function runEntrance(targets: HTMLElement[], opts: Required<EntranceOptions>): JSAnimation {
  const { y, duration, stagger: step, delay, onDone } = opts

  for (const el of targets) el.style.transition = 'none'

  return animate(targets, {
    opacity: [0, 1],
    translateY: [y, 0],
    duration,
    delay: step ? stagger(step, { start: delay }) : delay,
    ease: 'out(3)',
    onComplete: () => {
      for (const el of targets) {
        el.style.transform = ''
        el.style.transition = ''
      }
      onDone()
    },
  })
}

/**
 * Staggered entrance for the direct children of a container — the home recipe grid.
 * Returns the animation, or `undefined` when it was skipped (reduced motion / no items),
 * so the caller can react (e.g. immediately drop its start-state marker either way).
 */
export function staggerChildrenIn(
  container: HTMLElement,
  opts: EntranceOptions = {},
): JSAnimation | undefined {
  if (prefersReducedMotion()) return
  const targets = Array.from(container.children) as HTMLElement[]
  if (!targets.length) return
  return runEntrance(targets, { y: 12, duration: 380, stagger: 42, delay: 0, onDone: noop, ...opts })
}

/**
 * Sequenced reveal for an ordered list of elements — the recipe detail page
 * (title, hero, meta, then ingredients / method easing in top-to-bottom).
 */
export function revealSequence(
  targets: Array<HTMLElement | null | undefined>,
  opts: EntranceOptions = {},
): JSAnimation | undefined {
  if (prefersReducedMotion()) return
  const els = targets.filter((el): el is HTMLElement => !!el)
  if (!els.length) return
  return runEntrance(els, { y: 16, duration: 400, stagger: 80, delay: 0, onDone: noop, ...opts })
}
