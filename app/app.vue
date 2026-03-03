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
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>