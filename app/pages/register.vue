<template>
  <div class="min-h-screen flex items-center justify-center px-4 relative">
    <!-- Language Switcher -->
    <button
      class="absolute top-4 right-4 px-2.5 py-1.5 text-xs font-medium text-white/40 hover:text-white/70 bg-white/3 hover:bg-white/6 border border-white/6 hover:border-white/10 rounded-lg transition-all duration-200 cursor-pointer"
      @click="toggleLocale"
    >
      {{ locale === 'tr' ? 'EN' : 'TR' }}
    </button>

    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="flex flex-col items-center mb-8">
        <svg class="mb-4" width="40" height="34" viewBox="0 0 28 24" fill="none">
          <path d="M11 4L4 12L11 20" stroke="#ff3e3e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M17 4L24 12L17 20" stroke="#888888" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <h1 class="text-white/90 text-xl font-bold tracking-wide">{{ $t('app.name') }}</h1>
        <p class="text-white/35 text-sm mt-1">{{ $t('auth.signUpSubtitle') }}</p>
      </div>

      <!-- Form -->
      <form class="space-y-4" @submit.prevent="handleRegister">
        <div>
          <label class="block text-white/50 text-xs font-medium mb-1.5">{{ $t('auth.username') }}</label>
          <div class="relative">
            <UIcon name="i-lucide-user" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/25 pointer-events-none" />
            <input
              v-model="username"
              type="text"
              :placeholder="$t('auth.usernamePlaceholder')"
              :disabled="authLoading"
              autocomplete="username"
              class="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/8 rounded-lg text-sm text-white/90 placeholder-white/25 outline-none transition-all duration-200 focus:border-primary-500/40 focus:bg-white/7 disabled:opacity-50"
            >
          </div>
        </div>

        <div>
          <label class="block text-white/50 text-xs font-medium mb-1.5">{{ $t('auth.email') }}</label>
          <div class="relative">
            <UIcon name="i-lucide-mail" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/25 pointer-events-none" />
            <input
              v-model="email"
              type="email"
              :placeholder="$t('auth.emailPlaceholder')"
              :disabled="authLoading"
              autocomplete="email"
              class="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/8 rounded-lg text-sm text-white/90 placeholder-white/25 outline-none transition-all duration-200 focus:border-primary-500/40 focus:bg-white/7 disabled:opacity-50"
            >
          </div>
        </div>

        <div>
          <label class="block text-white/50 text-xs font-medium mb-1.5">{{ $t('auth.password') }}</label>
          <div class="relative">
            <UIcon name="i-lucide-lock" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/25 pointer-events-none" />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="$t('auth.minChars')"
              :disabled="authLoading"
              autocomplete="new-password"
              class="w-full pl-9 pr-10 py-2.5 bg-white/5 border border-white/8 rounded-lg text-sm text-white/90 placeholder-white/25 outline-none transition-all duration-200 focus:border-primary-500/40 focus:bg-white/7 disabled:opacity-50"
            >
            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/25 hover:text-white/50 transition-colors cursor-pointer"
              tabindex="-1"
              @click="showPassword = !showPassword"
            >
              <UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="size-4" />
            </button>
          </div>
        </div>

        <div>
          <label class="block text-white/50 text-xs font-medium mb-1.5">{{ $t('auth.confirmPassword') }}</label>
          <div class="relative">
            <UIcon name="i-lucide-lock" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/25 pointer-events-none" />
            <input
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="$t('auth.confirmPlaceholder')"
              :disabled="authLoading"
              autocomplete="new-password"
              class="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/8 rounded-lg text-sm text-white/90 placeholder-white/25 outline-none transition-all duration-200 focus:border-primary-500/40 focus:bg-white/7 disabled:opacity-50"
            >
          </div>
        </div>

        <!-- Error -->
        <Transition name="fade">
          <div v-if="errorMsg" class="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
            <UIcon name="i-lucide-alert-circle" class="size-4 text-red-400 shrink-0" />
            <span class="text-xs text-red-300">{{ errorMsg }}</span>
          </div>
        </Transition>

        <button
          type="submit"
          :disabled="!canSubmit || authLoading"
          class="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-white/8 disabled:text-white/25 text-white text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
        >
          <UIcon v-if="authLoading" name="i-lucide-loader-2" class="size-4 animate-spin" />
          {{ authLoading ? $t('auth.signingUp') : $t('auth.signUp') }}
        </button>
      </form>

      <!-- Login Link -->
      <p class="text-center text-white/30 text-xs mt-6">
        {{ $t('auth.hasAccount') }}
        <NuxtLink to="/login" class="text-primary-400 hover:text-primary-300 transition-colors">
          {{ $t('auth.signIn') }}
        </NuxtLink>
      </p>

      <!-- Social Login -->
      <SocialAuth />
    </div>
  </div>
</template>

<script setup lang="ts">
const { register, authLoading } = useAuth()
const { locale, setLocale } = useI18n()

function toggleLocale(): void {
  setLocale(locale.value === 'tr' ? 'en' : 'tr')
}

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const errorMsg = ref('')

const canSubmit = computed(() =>
  username.value.trim().length >= 3
  && email.value.includes('@')
  && password.value.length >= 6
  && confirmPassword.value === password.value,
)

async function handleRegister(): Promise<void> {
  if (!canSubmit.value || authLoading.value) return
  errorMsg.value = ''

  const err = await register(username.value.trim(), email.value.trim(), password.value)
  if (err) {
    errorMsg.value = err
  }
  else {
    navigateTo('/tracker')
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
