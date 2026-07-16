// A tiny transient-toast channel for the admin section (the design's "Recipe saved"
// pill). Backed by useState so a message set just before a redirect — e.g. save → go to
// /admin — survives the navigation and is shown once on the next screen. Rendered by
// <AdminFlash> in the admin layout.
export interface AdminFlash {
  message: string
  tone: 'success' | 'error'
}

export function useAdminFlash() {
  const flash = useState<AdminFlash | null>('admin-flash', () => null)

  let timer: ReturnType<typeof setTimeout> | undefined

  function show(message: string, tone: AdminFlash['tone'] = 'success') {
    flash.value = { message, tone }
    if (import.meta.client) {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => (flash.value = null), 2600)
    }
  }

  return {
    flash,
    notifySaved: (message = 'Recipe saved') => show(message, 'success'),
    notifyDeleted: (message = 'Recipe deleted') => show(message, 'success'),
    notifyError: (message: string) => show(message, 'error'),
    dismiss: () => (flash.value = null),
  }
}
