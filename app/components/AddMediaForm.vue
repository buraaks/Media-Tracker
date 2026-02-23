<template>
  <div ref="formWrapper" class="relative">
    <form class="flex gap-3 max-sm:flex-col" @submit.prevent="handleSubmit">
      <div class="relative flex-1">
        <UIcon
          name="i-lucide-search"
          class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/30 pointer-events-none"
        />
        <input
          ref="inputEl"
          v-model="query"
          type="text"
          :placeholder="placeholder"
          :disabled="adding"
          class="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/8 rounded-lg text-sm text-white/90 placeholder-white/30 outline-none transition-all duration-200 focus:border-primary-500/40 focus:bg-white/7 disabled:opacity-50"
          autocomplete="off"
          @input="onInput"
          @keydown.enter.prevent="handleSubmit"
          @keydown.arrow-down.prevent="moveSelection(1)"
          @keydown.arrow-up.prevent="moveSelection(-1)"
          @keydown.escape="closeDropdown"
          @focus="onFocus"
        >

        <!-- Search Results Dropdown -->
        <Transition name="dropdown">
          <div
            v-if="showDropdown"
            class="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#1c1c1c] border border-white/8 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <!-- Loading -->
            <div v-if="searchLoading" class="flex items-center justify-center gap-2 px-4 py-5">
              <UIcon name="i-lucide-loader-2" class="size-4 text-white/30 animate-spin" />
              <span class="text-xs text-white/30">{{ $t('media.searching') }}</span>
            </div>

            <!-- Results -->
            <template v-else-if="results.length">
              <button
                v-for="(result, i) in results"
                :key="result.imdbId || result.title + result.year"
                type="button"
                class="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-150 cursor-pointer"
                :class="i === selectedIndex
                  ? 'bg-primary-500/10'
                  : 'hover:bg-white/[0.04]'"
                @click="selectItem(result)"
                @mouseenter="selectedIndex = i"
              >
                <div class="relative w-10 h-14 shrink-0 rounded-md overflow-hidden bg-white/5">
                  <img
                    v-if="result.image"
                    :src="result.image"
                    :alt="result.title"
                    class="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  >
                  <div v-else class="absolute inset-0 flex items-center justify-center">
                    <UIcon name="i-lucide-image-off" class="size-4 text-white/15" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-white/85 font-medium truncate">{{ result.title }}</p>
                  <p v-if="result.year !== '-'" class="text-xs text-white/35 mt-0.5">{{ result.year }}</p>
                </div>
                <UIcon name="i-lucide-plus" class="size-4 text-white/20 shrink-0" />
              </button>
            </template>

            <!-- No Results -->
            <div v-else class="flex items-center justify-center gap-2 px-4 py-5">
              <UIcon name="i-lucide-search-x" class="size-4 text-white/20" />
              <span class="text-xs text-white/30">{{ $t('media.noResults') }}</span>
            </div>
          </div>
        </Transition>
      </div>
    </form>

    <!-- Error Message -->
    <Transition name="fade">
      <div
        v-if="error"
        class="mt-3 flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg"
      >
        <UIcon name="i-lucide-alert-circle" class="size-4 text-red-400 shrink-0" />
        <span class="text-sm text-red-300">{{ error }}</span>
      </div>
    </Transition>

    <!-- Duplicate Warning -->
    <Transition name="fade">
      <div
        v-if="duplicateWarning"
        class="mt-3 flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg"
      >
        <UIcon name="i-lucide-info" class="size-4 text-amber-400 shrink-0" />
        <span class="text-sm text-amber-300">{{ duplicateWarning }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { MediaCategory, SearchResult } from '~/types/media'

const props = defineProps<{
  category: MediaCategory
}>()

const { t } = useI18n()
const { searchMultiple, selectResult, searchLoading, loading: adding, error } = useMediaApi()
const { addItem } = useMediaStore()

const query = ref('')
const duplicateWarning = ref('')
const results = ref<SearchResult[]>([])
const selectedIndex = ref(-1)
const dropdownOpen = ref(false)
const formWrapper = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const placeholderMap: Record<MediaCategory, string> = {
  film: 'media.searchFilm',
  dizi: 'media.searchSeries',
  anime: 'media.searchAnime',
  manga: 'media.searchManga',
}

const placeholder = computed(() => t(placeholderMap[props.category]))

const showDropdown = computed(() =>
  dropdownOpen.value && query.value.trim().length >= 2 && (searchLoading.value || results.value.length > 0 || (!searchLoading.value && results.value.length === 0 && lastSearchQuery.value !== '')),
)

const lastSearchQuery = ref('')

function onInput(): void {
  duplicateWarning.value = ''
  error.value = null
  selectedIndex.value = -1

  if (debounceTimer) clearTimeout(debounceTimer)

  const trimmed = query.value.trim()
  if (trimmed.length < 2) {
    results.value = []
    lastSearchQuery.value = ''
    dropdownOpen.value = false
    return
  }

  dropdownOpen.value = true
  debounceTimer = setTimeout(async () => {
    const res = await searchMultiple(trimmed, props.category)
    if (query.value.trim() === trimmed) {
      results.value = res
      lastSearchQuery.value = trimmed
    }
  }, 400)
}

function onFocus(): void {
  if (results.value.length > 0 && query.value.trim().length >= 2) {
    dropdownOpen.value = true
  }
}

function closeDropdown(): void {
  dropdownOpen.value = false
  selectedIndex.value = -1
}

function moveSelection(delta: number): void {
  if (!results.value.length) return
  const len = results.value.length
  selectedIndex.value = (selectedIndex.value + delta + len) % len
}

async function selectItem(result: SearchResult): Promise<void> {
  closeDropdown()
  duplicateWarning.value = ''

  const item = await selectResult(result)
  if (!item) return

  const added = await addItem(item)
  if (!added) {
    duplicateWarning.value = t('media.duplicate', { title: item.title })
    return
  }

  query.value = ''
  results.value = []
  lastSearchQuery.value = ''
}

async function handleSubmit(): Promise<void> {
  if (selectedIndex.value >= 0 && results.value[selectedIndex.value]) {
    await selectItem(results.value[selectedIndex.value])
    return
  }

  if (results.value.length > 0) {
    await selectItem(results.value[0])
    return
  }

  const trimmed = query.value.trim()
  if (!trimmed) return

  const res = await searchMultiple(trimmed, props.category)
  if (res.length > 0) {
    results.value = res
    await selectItem(res[0])
  }
}

function onClickOutside(e: MouseEvent): void {
  if (formWrapper.value && !formWrapper.value.contains(e.target as Node)) {
    closeDropdown()
  }
}

watch(() => props.category, () => {
  duplicateWarning.value = ''
  error.value = null
  results.value = []
  lastSearchQuery.value = ''
  query.value = ''
  closeDropdown()
})

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dropdown-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
