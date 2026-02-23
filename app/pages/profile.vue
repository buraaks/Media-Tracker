<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="sticky top-0 z-50 backdrop-blur-2xl bg-[#1a1a1a]/60 border-b border-white/6">
      <div class="max-w-275 mx-auto px-8 py-3.5 flex items-center justify-between max-sm:px-4">
        <NuxtLink to="/tracker" class="flex items-center gap-3">
          <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
            <path d="M11 4L4 12L11 20" stroke="#ff3e3e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M17 4L24 12L17 20" stroke="#888888" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="text-white/90 font-semibold text-sm tracking-wide max-sm:hidden">{{ $t('app.name') }}</span>
        </NuxtLink>
        <NuxtLink
          to="/tracker"
          class="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          <UIcon name="i-lucide-arrow-left" class="size-4" />
          {{ $t('home.myList') }}
        </NuxtLink>
      </div>
    </header>

    <div class="max-w-xl mx-auto px-8 py-10 max-sm:px-4 max-sm:py-6">
      <h1 class="text-white/90 text-xl font-bold mb-8">{{ $t('profile.title') }}</h1>

      <!-- Edit Account -->
      <section class="mb-8">
        <h2 class="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">{{ $t('profile.editAccount') }}</h2>
        <form class="bg-white/[0.03] border border-white/6 rounded-xl p-5 space-y-4" @submit.prevent="handleSave">
          <!-- Username -->
          <div>
            <label class="block text-white/50 text-xs font-medium mb-1.5">{{ $t('profile.username') }}</label>
            <div class="relative">
              <UIcon name="i-lucide-user" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/25 pointer-events-none" />
              <input
                v-model="form.username"
                type="text"
                :disabled="saving"
                class="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/8 rounded-lg text-sm text-white/90 placeholder-white/25 outline-none transition-all duration-200 focus:border-primary-500/40 focus:bg-white/7 disabled:opacity-50"
              >
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-white/50 text-xs font-medium mb-1.5">{{ $t('profile.email') }}</label>
            <div class="relative">
              <UIcon name="i-lucide-mail" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/25 pointer-events-none" />
              <input
                v-model="form.email"
                type="email"
                :disabled="saving"
                class="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/8 rounded-lg text-sm text-white/90 placeholder-white/25 outline-none transition-all duration-200 focus:border-primary-500/40 focus:bg-white/7 disabled:opacity-50"
              >
            </div>
          </div>

          <!-- New Password -->
          <div>
            <label class="block text-white/50 text-xs font-medium mb-1.5">{{ $t('profile.newPassword') }}</label>
            <div class="relative">
              <UIcon name="i-lucide-key-round" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/25 pointer-events-none" />
              <input
                v-model="form.newPassword"
                type="password"
                :placeholder="$t('profile.newPasswordPlaceholder')"
                :disabled="saving"
                autocomplete="new-password"
                class="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/8 rounded-lg text-sm text-white/90 placeholder-white/25 outline-none transition-all duration-200 focus:border-primary-500/40 focus:bg-white/7 disabled:opacity-50"
              >
            </div>
          </div>

          <div class="h-px bg-white/6" />

          <!-- Current Password (required) -->
          <div>
            <label class="block text-white/50 text-xs font-medium mb-1.5">{{ $t('profile.currentPassword') }}</label>
            <div class="relative">
              <UIcon name="i-lucide-lock" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/25 pointer-events-none" />
              <input
                v-model="form.currentPassword"
                type="password"
                :placeholder="$t('profile.currentPasswordPlaceholder')"
                :disabled="saving"
                autocomplete="current-password"
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

          <!-- Success -->
          <Transition name="fade">
            <div v-if="successMsg" class="flex items-center gap-2 px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <UIcon name="i-lucide-check-circle" class="size-4 text-emerald-400 shrink-0" />
              <span class="text-xs text-emerald-300">{{ successMsg }}</span>
            </div>
          </Transition>

          <button
            type="submit"
            :disabled="!canSave || saving"
            class="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-white/8 disabled:text-white/25 text-white text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
          >
            <UIcon v-if="saving" name="i-lucide-loader-2" class="size-4 animate-spin" />
            {{ saving ? $t('profile.saving') : $t('profile.save') }}
          </button>
        </form>
      </section>

      <!-- Settings -->
      <section class="mb-8">
        <h2 class="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">{{ $t('profile.settings') }}</h2>
        <div class="bg-white/[0.03] border border-white/6 rounded-xl overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4">
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-languages" class="size-4 text-white/30" />
              <span class="text-sm text-white/50">{{ $t('profile.language') }}</span>
            </div>
            <div class="flex items-center gap-1 bg-white/5 border border-white/8 rounded-lg p-0.5">
              <button
                class="px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer"
                :class="locale === 'tr'
                  ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                  : 'text-white/40 hover:text-white/60 border border-transparent'"
                @click="setLocale('tr')"
              >
                TR
              </button>
              <button
                class="px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer"
                :class="locale === 'en'
                  ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                  : 'text-white/40 hover:text-white/60 border border-transparent'"
                @click="setLocale('en')"
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Sign Out -->
      <section>
        <button
          class="w-full flex items-center justify-between px-5 py-4 bg-white/[0.03] border border-white/6 hover:border-red-500/20 hover:bg-red-500/5 rounded-xl transition-all duration-200 cursor-pointer group"
          @click="handleLogout"
        >
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-log-out" class="size-4 text-red-400/60 group-hover:text-red-400" />
            <span class="text-sm text-red-400/60 group-hover:text-red-400 font-medium transition-colors">{{ $t('profile.signOut') }}</span>
          </div>
          <UIcon name="i-lucide-chevron-right" class="size-4 text-white/15 group-hover:text-red-400/40" />
        </button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { user: authUser, updateProfile, authLoading: saving, logout } = useAuth()
const { locale, setLocale } = useI18n()

const form = reactive({
  username: authUser.value?.username ?? '',
  email: authUser.value?.email ?? '',
  newPassword: '',
  currentPassword: '',
})

const errorMsg = ref('')
const successMsg = ref('')

const canSave = computed(() => form.currentPassword.length > 0)

watch(authUser, (u) => {
  if (u) {
    form.username = u.username
    form.email = u.email
  }
})

async function handleSave(): Promise<void> {
  if (!canSave.value || saving.value) return
  errorMsg.value = ''
  successMsg.value = ''

  const err = await updateProfile({
    username: form.username.trim(),
    email: form.email.trim(),
    newPassword: form.newPassword,
    currentPassword: form.currentPassword,
  })

  if (err) {
    errorMsg.value = err
  }
  else {
    successMsg.value = t('profile.saved')
    form.newPassword = ''
    form.currentPassword = ''
    setTimeout(() => { successMsg.value = '' }, 3000)
  }
}

function handleLogout(): void {
  logout()
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
