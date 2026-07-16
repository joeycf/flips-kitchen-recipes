// Gate the admin section. Applied per-page via definePageMeta({ middleware: 'auth' }) on
// the /admin pages — NOT globally — so the rest of the site stays public (the Supabase
// module runs with redirect:false). Unauthenticated visitors are sent to /login with the
// intended path preserved, so login can bounce them back.
export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  if (user.value) return

  // /admin is ssr:false, so this runs on the client. On a cold load the user ref may not
  // have populated from the stored session yet — confirm against the live session before
  // redirecting, to avoid bouncing an actually-logged-in owner on first paint.
  if (import.meta.client) {
    const supabase = useSupabaseClient()
    const { data } = await supabase.auth.getSession()
    if (data.session) return
  }

  return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
})
