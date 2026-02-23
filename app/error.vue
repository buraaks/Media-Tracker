<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-6 bg-[#1a1a1a]">
    <p class="text-[clamp(5rem,20vw,10rem)] font-extrabold leading-none tracking-tight bg-linear-to-br from-primary-500 to-primary-300 bg-clip-text text-transparent">
      {{ error?.statusCode || 500 }}
    </p>
    <p class="mt-4 text-white/50 text-lg text-center max-w-md">
      {{ error?.statusCode === 404 ? 'Aradığınız sayfa bulunamadı.' : 'Bir şeyler ters gitti.' }}
    </p>
    <UButton
      class="mt-8"
      variant="soft"
      color="primary"
      icon="i-lucide-home"
      size="lg"
      @click="handleError"
    >
      Anasayfaya Dön
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

function handleError(): void {
  clearError({ redirect: '/' })
}
</script>
