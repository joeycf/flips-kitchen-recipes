<template>
  <div>
    <SkipLink />
    <AdminHeader />
    <slot />
    <AdminFlash />
  </div>
</template>

<script setup lang="ts">
// Chrome for the /admin section: its own header (with logout) plus the shared flash
// toast. Applied via definePageMeta({ layout: 'admin' }) on the admin pages, which also
// carry the `auth` middleware.
// Explicit imports — components/admin/ is path-prefixed by Nuxt auto-import; importing
// keeps the whole admin tree compile-checked so it can't silently render nothing.
import AdminHeader from '~/components/admin/AdminHeader.vue'
import AdminFlash from '~/components/admin/AdminFlash.vue'
</script>
