<script setup lang="ts">
// If someone visits /tracker, just take them to /tracker/film
onMounted(() => {
  navigateTo('/tracker/film', { replace: true })
})

// Server side redirect
definePageMeta({
  middleware: [
    function (to) {
      if (to.path === '/tracker' || to.path === '/tracker/') {
        return navigateTo('/tracker/film', { redirectCode: 301 })
      }
    }
  ]
})
</script>

<template>
  <div />
</template>
