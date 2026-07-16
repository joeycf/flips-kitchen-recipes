<template>
  <!--
    First focusable element on the page: hidden until a keyboard user tabs to it, then it
    appears top-left and jumps focus past the header to the page's <main id="main-content">.
  -->
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:inline-flex focus:items-center focus:rounded-field focus:bg-clay focus:px-4 focus:py-2.5 focus:text-[14px] focus:font-semibold focus:text-[#FFF7EF] focus:shadow-clay"
  >
    Skip to content
  </a>
</template>
