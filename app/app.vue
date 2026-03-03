<script setup lang="ts">
const { installPrompt } = usePwa()

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      installPrompt.value = e
    })
  }
})
</script>

<template>
  <UApp>
    <GuestBanner />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>