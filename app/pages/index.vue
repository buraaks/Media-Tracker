<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-50 backdrop-blur-2xl bg-[#1a1a1a]/60 border-b border-transparent">
      <div class="max-w-275 mx-auto px-8 py-3.5 flex items-center justify-between max-sm:px-4">
        <div class="flex items-center gap-3">
          <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
            <path d="M11 4L4 12L11 20" stroke="#ff3e3e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M17 4L24 12L17 20" stroke="#888888" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="text-white/90 font-semibold text-sm tracking-wide">{{ $t('app.name') }}</span>
        </div>
        <div class="flex items-center gap-3">
          <!-- Language Switcher -->
          <button
            class="px-2.5 py-1.5 text-xs font-medium text-white/40 hover:text-white/70 bg-white/[0.03] hover:bg-white/[0.06] border border-white/6 hover:border-white/10 rounded-lg transition-all duration-200 cursor-pointer"
            @click="toggleLocale"
          >
            {{ locale === 'tr' ? 'EN' : 'TR' }}
          </button>

          <NuxtLink
            v-if="isAuthenticated"
            to="/tracker"
            class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-all duration-200"
          >
            {{ $t('home.myList') }}
          </NuxtLink>
          <template v-else>
            <NuxtLink
              to="/login"
              class="px-4 py-2 text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              {{ $t('auth.signIn') }}
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-all duration-200"
            >
              {{ $t('auth.signUp') }}
            </NuxtLink>
          </template>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="flex-1 flex flex-col items-center justify-center px-8 py-20 max-sm:px-4 max-sm:py-12">
      <div class="max-w-2xl text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full mb-6">
          <UIcon name="i-lucide-sparkles" class="size-3.5 text-primary-400" />
          <span class="text-xs text-primary-300 font-medium">{{ $t('home.badge') }}</span>
        </div>

        <h1 class="text-4xl font-bold text-white/95 leading-tight mb-4 max-sm:text-2xl">
          {{ $t('home.titleStart') }}
          <span class="text-primary-500">{{ $t('home.titleHighlight') }}</span>
        </h1>

        <p class="text-white/40 text-lg leading-relaxed mb-10 max-w-lg mx-auto max-sm:text-base">
          {{ $t('home.description') }}
        </p>

        <NuxtLink
          :to="isAuthenticated ? '/tracker' : '/register'"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-[0_8px_24px_rgba(255,62,62,0.25)]"
        >
          {{ isAuthenticated ? $t('home.myList') : $t('home.cta') }}
          <UIcon name="i-lucide-arrow-right" class="size-4" />
        </NuxtLink>
      </div>

      <!-- Feature Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl w-full max-sm:grid-cols-2">
        <div
          v-for="feature in features"
          :key="feature.key"
          class="flex flex-col items-center gap-3 p-5 bg-white/[0.03] border border-white/6 rounded-xl max-sm:p-4"
        >
          <div class="flex items-center justify-center size-10 rounded-lg bg-white/5 border border-white/6">
            <UIcon :name="feature.icon" class="size-5" :style="{ color: feature.color }" />
          </div>
          <span class="text-white/50 text-sm font-medium max-sm:text-xs">{{ $t(`nav.${feature.key}`) }}</span>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <footer class="border-t border-white/6 py-10 px-8 max-sm:px-4">
      <div class="max-w-2xl mx-auto text-center">
        <h2 class="text-white/70 text-sm font-semibold mb-5">{{ $t('home.contact') }}</h2>
        <div class="flex items-center justify-center gap-4 flex-wrap">
          <a
            v-for="link in socialLinks"
            :key="link.label"
            :href="link.url"
            target="_blank"
            rel="noopener"
            class="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/6 hover:border-white/12 hover:bg-white/[0.06] rounded-lg transition-all duration-200"
          >
            <UIcon :name="link.icon" class="size-4" :style="{ color: link.color }" />
            <span class="text-sm text-white/55 hover:text-white/80 transition-colors">{{ link.label }}</span>
          </a>
          <button
            class="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/6 hover:border-white/12 hover:bg-white/[0.06] rounded-lg transition-all duration-200 cursor-pointer"
            @click="copyEmail"
          >
            <UIcon :name="copied ? 'i-lucide-check' : 'i-lucide-mail'" class="size-4" :style="{ color: copied ? '#4ade80' : '#ff3e3e' }" />
            <span class="text-sm transition-colors" :class="copied ? 'text-emerald-400' : 'text-white/55'">
              {{ copied ? $t('home.copied') : 'example@gmail.com' }}
            </span>
          </button>
        </div>
        <p class="text-white/20 text-xs mt-6">Burak Temur</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { isAuthenticated } = useAuth()
const { locale, setLocale } = useI18n()
const copied = ref(false)

const features = [
  { key: 'film', icon: 'i-lucide-clapperboard', color: '#f87171' },
  { key: 'series', icon: 'i-lucide-tv', color: '#60a5fa' },
  { key: 'anime', icon: 'i-lucide-sparkles', color: '#c084fc' },
  { key: 'manga', icon: 'i-lucide-book-open', color: '#4ade80' },
]

const socialLinks = [
  { label: 'GitHub', icon: 'i-simple-icons-github', url: 'https://github.com/example', color: '#e6edf3' },
  { label: 'LinkedIn', icon: 'i-simple-icons-linkedin', url: 'https://www.linkedin.com/in/example/', color: '#0a66c2' },
  { label: 'Instagram', icon: 'i-simple-icons-instagram', url: 'https://www.instagram.com/example', color: '#e4405f' },
  { label: 'Discord', icon: 'i-simple-icons-discord', url: 'https://discord.com/channels/0000000000000', color: '#5865f2' },
]

function toggleLocale(): void {
  setLocale(locale.value === 'tr' ? 'en' : 'tr')
}

async function copyEmail(): Promise<void> {
  try {
    await navigator.clipboard.writeText('example@gmail.com')
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
  catch { /* clipboard not available */ }
}
</script>
