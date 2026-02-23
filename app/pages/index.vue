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
        <div class="flex items-center gap-3 max-sm:gap-2">
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
            class="px-4 py-2 max-sm:px-3 max-sm:text-xs bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-all duration-200"
          >
            {{ $t('home.myList') }}
          </NuxtLink>
          <template v-else>
            <NuxtLink
              to="/login"
              class="px-4 py-2 max-sm:px-3 max-sm:text-xs text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              {{ $t('auth.signIn') }}
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="px-4 py-2 max-sm:px-3 max-sm:text-xs bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-all duration-200"
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
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl w-full">
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

    <!-- Footer -->
    <footer class="border-t border-white/6 px-8 py-5 max-sm:px-4">
      <div class="max-w-275 mx-auto flex items-center justify-between flex-wrap gap-3">
        <span class="text-white/20 text-xs">&copy; {{ new Date().getFullYear() }} Burak Temur</span>
        <div class="flex items-center gap-1 max-sm:gap-0.5">
          <a
            v-for="link in socialLinks"
            :key="link.label"
            :href="link.url"
            target="_blank"
            rel="noopener"
            :title="link.label"
            class="flex items-center justify-center size-8 rounded-lg hover:bg-white/5 transition-all duration-200"
          >
            <UIcon :name="link.icon" class="size-4 text-white/25 hover:text-white/50 transition-colors" />
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { isAuthenticated } = useAuth()
const { locale, setLocale } = useI18n()

const features = [
  { key: 'film', icon: 'i-lucide-clapperboard', color: '#f87171' },
  { key: 'series', icon: 'i-lucide-tv', color: '#60a5fa' },
  { key: 'anime', icon: 'i-lucide-sparkles', color: '#c084fc' },
  { key: 'manga', icon: 'i-lucide-book-open', color: '#4ade80' },
]

const socialLinks = [
  { label: 'GitHub', icon: 'i-simple-icons-github', url: 'https://github.com/buraaks' },
  { label: 'LinkedIn', icon: 'i-simple-icons-linkedin', url: 'https://www.linkedin.com/in/burak-temur-a39432300/' },
  { label: 'Instagram', icon: 'i-simple-icons-instagram', url: 'https://www.instagram.com/burak._.tmr8' },
  { label: 'Discord', icon: 'i-simple-icons-discord', url: 'https://discord.com/channels/828344938944921630' },
  { label: 'Email', icon: 'i-lucide-mail', url: 'mailto:buraktemur0816@gmail.com' },
]

function toggleLocale(): void {
  setLocale(locale.value === 'tr' ? 'en' : 'tr')
}
</script>
