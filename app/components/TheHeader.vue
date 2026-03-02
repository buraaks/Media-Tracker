<template>
  <header
    class="sticky top-0 z-50 backdrop-blur-2xl border-b transition-all duration-300"
    :class="scrolled
      ? 'bg-[#1a1a1a]/85 border-primary-500/12 shadow-[0_4px_24px_rgba(0,0,0,0.3)]'
      : 'bg-[#1a1a1a]/60 border-transparent'"
  >
    <div class="max-w-275 mx-auto px-8 py-3.5 flex items-center justify-between max-sm:px-4">
      <!-- Logo + Title -->
      <NuxtLink to="/" class="flex items-center gap-3 shrink-0">
        <svg class="block transition-all duration-300 hover:scale-105 hover:filter-[drop-shadow(0_0_6px_rgba(255,62,62,0.4))]" width="28" height="24" viewBox="0 0 28 24" fill="none">
          <path d="M11 4L4 12L11 20" stroke="#ff3e3e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M17 4L24 12L17 20" stroke="#888888" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="text-white/90 font-semibold text-sm tracking-wide max-sm:hidden">{{ $t('app.name') }}</span>
      </NuxtLink>

      <!-- Category Tabs (Desktop) -->
      <nav class="flex items-center gap-1 max-md:hidden">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.key"
          :to="`/tracker/${tab.key}`"
          class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer"
          :class="modelValue === tab.key
            ? 'text-primary-500 bg-primary-500/10'
            : 'text-white/50 hover:text-white/80 hover:bg-white/4'"
        >
          <UIcon :name="tab.icon" class="size-4" />
          {{ $t(`nav.${tab.i18nKey}`) }}
        </NuxtLink>
      </nav>

      <!-- User Menu -->
      <div class="flex items-center gap-3 shrink-0">
        <UPopover
          :content="{ side: 'bottom', align: 'end', sideOffset: 8 }"
          :ui="{ content: 'z-[200]' }"
        >
          <button class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/4 border border-white/6 hover:bg-white/8 hover:border-white/10 transition-all duration-200 cursor-pointer">
            <UIcon name="i-lucide-user" class="size-3.5 text-primary-400" />
            <span v-if="authUser" class="text-xs text-white/60 max-sm:hidden">{{ authUser.username }}</span>
          </button>
          <template #content>
            <div class="user-panel">
              <div v-if="authUser" class="px-3 py-2.5 border-b border-white/6">
                <p class="text-sm text-white/80 font-medium">{{ authUser.username }}</p>
                <p class="text-xs text-white/35 mt-0.5">{{ authUser.email }}</p>
              </div>
              <NuxtLink to="/profile" class="menu-item group w-full">
                <UIcon name="i-lucide-settings" class="size-4 shrink-0 text-white/35" />
                <span class="text-[13px] text-white/65 group-hover:text-white transition-colors">{{ $t('profile.title') }}</span>
              </NuxtLink>
              <div class="mx-2.5 my-0.5 h-px bg-white/6" />
              <button class="menu-item group w-full" @click="handleLogout">
                <UIcon name="i-lucide-log-out" class="size-4 shrink-0 text-red-400" />
                <span class="text-[13px] text-white/65 group-hover:text-red-400 transition-colors">{{ $t('auth.signOut') }}</span>
              </button>
            </div>
          </template>
        </UPopover>
      </div>
    </div>

    <!-- Category Tabs (Mobile) -->
    <div class="hidden max-md:flex border-t border-white/5 overflow-x-auto scrollbar-hide">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.key"
        :to="`/tracker/${tab.key}`"
        class="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer border-b-2 flex-1 justify-center"
        :class="modelValue === tab.key
          ? 'text-primary-500 border-primary-500 bg-primary-500/5'
          : 'text-white/45 border-transparent hover:text-white/70'"
      >
        <UIcon :name="tab.icon" class="size-3.5" />
        {{ $t(`nav.${tab.i18nKey}`) }}
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { MediaCategory } from '~/types/media'

defineProps<{
  modelValue: MediaCategory
}>()

defineEmits<{
  'update:modelValue': [value: MediaCategory]
}>()

const tabs = [
  { key: 'film' as MediaCategory, i18nKey: 'film', icon: 'i-lucide-clapperboard' },
  { key: 'dizi' as MediaCategory, i18nKey: 'series', icon: 'i-lucide-tv' },
  { key: 'anime' as MediaCategory, i18nKey: 'anime', icon: 'i-lucide-sparkles' },
  { key: 'manga' as MediaCategory, i18nKey: 'manga', icon: 'i-lucide-book-open' },
]

const { user: authUser, logout } = useAuth()
const scrolled = ref(false)

function handleLogout(): void {
  logout()
}

function onScroll(): void {
  scrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.user-panel {
  width: 200px;
  padding: 4px;
  background: #1c1c1c;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 6px;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
