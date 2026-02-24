<template>
  <div class="min-h-screen flex items-center justify-center px-4 relative">
    <div class="w-full max-w-sm text-center">
      <div v-if="loading" class="flex flex-col items-center">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary-500 mb-4" />
        <h2 class="text-white/90 text-xl font-bold">{{ $t('verify.verifying') }}</h2>
        <p class="text-white/50 text-sm mt-2">{{ $t('verify.pleaseWait') }}</p>
      </div>

      <div v-else-if="success" class="flex flex-col items-center">
        <div class="size-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4 border border-green-500/20">
          <UIcon name="i-lucide-check" class="size-6 text-green-400" />
        </div>
        <h2 class="text-white/90 text-xl font-bold">{{ $t('verify.success') }}</h2>
        <p class="text-white/50 text-sm mt-2">{{ message }}</p>
        <NuxtLink to="/tracker" class="mt-6 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-all duration-200 inline-block">
          {{ $t('verify.backToApp') }}
        </NuxtLink>
      </div>

      <div v-else class="flex flex-col items-center">
        <div class="size-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
          <UIcon name="i-lucide-alert-triangle" class="size-6 text-red-400" />
        </div>
        <h2 class="text-white/90 text-xl font-bold">{{ $t('verify.failed') }}</h2>
        <p class="text-red-300/80 text-sm mt-2">{{ message }}</p>
        <NuxtLink to="/login" class="mt-6 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/8 text-white text-sm font-medium rounded-lg transition-all duration-200 inline-block">
          {{ $t('auth.signIn') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const loading = ref(true)
const success = ref(false)
const message = ref('')

onMounted(async () => {
  const token = route.query.token as string
  if (!token) {
    loading.value = false
    success.value = false
    message.value = t('verify.invalidLink')
    return
  }

  try {
    const res = await $fetch<{ success: boolean; message: string }>('/api/auth/verify_email.php', {
      method: 'POST',
      body: { token }
    })
    
    success.value = res.success
    message.value = res.message || t('verify.emailVerified')
  } catch (e: any) {
    success.value = false
    message.value = e.data?.message || e.message || t('verify.error')
  } finally {
    loading.value = false
  }
})
</script>

