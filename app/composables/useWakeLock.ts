// Screen Wake Lock helper for cook mode. Requests a 'screen' lock so the device
// won't dim or sleep while cooking, and transparently re-acquires it when the tab
// returns to the foreground (browsers auto-release the lock on tab hide). No-ops
// where unsupported (e.g. older iOS Safari) so callers can still show their focused
// view. Releases automatically when the owning component scope is disposed.
export function useWakeLock() {
  const isSupported = import.meta.client && 'wakeLock' in navigator
  const isActive = ref(false)

  let sentinel: WakeLockSentinel | null = null
  // Whether the caller currently wants the screen kept awake — drives re-acquisition
  // after the tab regains focus.
  let desired = false

  async function acquire() {
    if (!isSupported || sentinel) return
    try {
      sentinel = await navigator.wakeLock.request('screen')
      isActive.value = true
      sentinel.addEventListener('release', () => {
        isActive.value = false
        sentinel = null
      })
    } catch {
      // Typically an AbortError when the page isn't visible/focused — stay inactive
      // and let the visibility handler retry.
      isActive.value = false
    }
  }

  function handleVisibility() {
    if (desired && document.visibilityState === 'visible') void acquire()
  }

  async function request() {
    if (!isSupported) return
    desired = true
    document.addEventListener('visibilitychange', handleVisibility)
    await acquire()
  }

  async function release() {
    desired = false
    if (import.meta.client) {
      document.removeEventListener('visibilitychange', handleVisibility)
    }
    try {
      await sentinel?.release()
    } catch {
      // Already released (e.g. by the browser) — nothing to do.
    }
    sentinel = null
    isActive.value = false
  }

  onScopeDispose(() => {
    void release()
  })

  return { isSupported, isActive, request, release }
}
