<script setup lang="ts">
// Simple redirect from /tracker to /tracker/film
onMounted(() => {
  navigateTo('/tracker/film', { replace: true })
})

definePageMeta({
  middleware: [
    () => navigateTo('/tracker/film', { redirectCode: 301 })
  ]
})
</script>

<template>
  <div />
</template>
