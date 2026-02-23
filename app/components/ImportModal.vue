<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[100]">
      <!-- Overlay -->
      <Transition name="overlay">
        <div
          v-if="open"
          class="absolute inset-0 bg-black/70"
          @click="close"
        />
      </Transition>

      <!-- Content -->
      <Transition name="content" appear>
        <div
          v-if="open"
          class="absolute inset-0 flex items-center justify-center p-4 pointer-events-none"
        >
          <div class="relative w-full max-w-md bg-[#1c1c1c] border border-white/8 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-auto">
          <div class="p-6">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="flex items-center justify-center size-9 rounded-lg bg-primary-500/10 border border-primary-500/20">
                  <UIcon :name="isAniList ? 'i-lucide-download' : 'i-lucide-file-text'" class="size-4 text-primary-400" />
                </div>
                <div>
                  <h3 class="text-white/90 font-semibold text-sm">{{ modalTitle }}</h3>
                  <p class="text-white/35 text-xs mt-0.5">{{ modalSubtitle }}</p>
                </div>
              </div>
              <button
                class="flex items-center justify-center size-7 rounded-md bg-white/5 border border-white/6 transition-all duration-200 hover:bg-white/10 cursor-pointer"
                @click="close"
              >
                <UIcon name="i-lucide-x" class="size-3.5 text-white/40" />
              </button>
            </div>

            <!-- AniList Form -->
            <div v-if="isAniList" class="space-y-4">
              <div class="relative">
                <UIcon
                  name="i-lucide-user"
                  class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/25 pointer-events-none"
                />
                <input
                  v-model="anilistUsername"
                  type="text"
                  :placeholder="$t('import.anilistUsername')"
                  :disabled="loading"
                  class="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/8 rounded-lg text-sm text-white/90 placeholder-white/30 outline-none transition-all duration-200 focus:border-primary-500/40 focus:bg-white/7 disabled:opacity-50"
                  @keydown.enter.prevent="startAniListImport"
                >
              </div>
              <p class="text-white/25 text-xs leading-relaxed">
                {{ $t('import.anilistNote', { link: '' }).split(linkPlaceholder)[0] }}
                <a href="https://anilist.co" target="_blank" class="text-primary-400 hover:underline">anilist.co</a>{{ $t('import.anilistNote', { link: '' }).split(linkPlaceholder)[1] || '' }}
              </p>
            </div>

            <!-- IMDb CSV Form -->
            <div v-else class="space-y-4">
              <label
                class="flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-white/8 rounded-xl cursor-pointer transition-all duration-200 hover:border-primary-500/30 hover:bg-white/[0.02]"
                :class="{ 'border-primary-500/40 bg-primary-500/5': csvFile }"
              >
                <UIcon
                  :name="csvFile ? 'i-lucide-file-check' : 'i-lucide-upload'"
                  class="size-6"
                  :class="csvFile ? 'text-primary-400' : 'text-white/20'"
                />
                <span class="text-xs" :class="csvFile ? 'text-primary-300' : 'text-white/30'">
                  {{ csvFile ? csvFile.name : $t('import.csvSelect') }}
                </span>
                <input
                  type="file"
                  accept=".csv"
                  class="hidden"
                  :disabled="loading"
                  @change="onFileSelect"
                >
              </label>
              <div class="space-y-2">
                <p class="text-white/25 text-xs leading-relaxed">
                  {{ $t('import.imdbNote') }}
                </p>
                <ol class="text-white/25 text-xs leading-relaxed list-decimal list-inside space-y-1">
                  <li><a href="https://www.imdb.com/list/watchlist" target="_blank" class="text-primary-400 hover:underline">IMDb Watchlist</a> {{ $t('import.imdbStep1', { link: '' }) }}</li>
                  <li>{{ $t('import.imdbStep2', { dots: '...', action: 'Export' }) }}</li>
                  <li>{{ $t('import.imdbStep3') }}</li>
                </ol>
              </div>
            </div>

            <!-- Progress -->
            <div v-if="importProgress" class="mt-5 space-y-3">
              <div class="flex items-center justify-between text-xs">
                <span class="text-white/40 truncate max-w-[60%]">{{ importProgress.currentTitle }}</span>
                <span class="text-white/30 shrink-0">{{ importProgress.current }} / {{ importProgress.total }}</span>
              </div>
              <div class="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  class="h-full bg-primary-500 rounded-full transition-all duration-300"
                  :style="{ width: `${progressPercent}%` }"
                />
              </div>
              <div class="flex gap-4 text-xs">
                <span class="text-emerald-400/70">{{ importProgress.imported }} {{ $t('import.added') }}</span>
                <span v-if="importProgress.skipped" class="text-amber-400/70">{{ importProgress.skipped }} {{ $t('import.skipped') }}</span>
                <span v-if="importProgress.failed" class="text-red-400/70">{{ importProgress.failed }} {{ $t('import.failed') }}</span>
              </div>
            </div>

            <!-- Error -->
            <div v-if="error" class="mt-4 flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
              <UIcon name="i-lucide-alert-circle" class="size-4 text-red-400 shrink-0" />
              <span class="text-xs text-red-300">{{ error }}</span>
            </div>

            <!-- Success -->
            <div v-if="!loading && importProgress && !error" class="mt-4 flex items-center gap-2 px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <UIcon name="i-lucide-check-circle" class="size-4 text-emerald-400 shrink-0" />
              <span class="text-xs text-emerald-300">
                {{ $t('import.importComplete', { count: importProgress.imported }) }}
              </span>
            </div>

            <!-- Action Button -->
            <div class="mt-5 flex justify-end gap-2">
              <button
                v-if="!loading && importProgress"
                class="px-4 py-2 text-sm text-white/50 hover:text-white/70 transition-colors cursor-pointer"
                @click="close"
              >
                {{ $t('import.close') }}
              </button>
              <button
                v-if="!importProgress || loading"
                :disabled="!canStart || loading"
                class="flex items-center gap-2 px-5 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-white/8 disabled:text-white/25 text-white text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
                @click="startImport"
              >
                <UIcon
                  v-if="loading"
                  name="i-lucide-loader-2"
                  class="size-4 animate-spin"
                />
                {{ loading ? $t('import.loading') : $t('import.startImport') }}
              </button>
            </div>
          </div>
        </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { MediaCategory } from '~/types/media'

const props = defineProps<{
  open: boolean
  category: MediaCategory
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { t } = useI18n()
const { importFromAniList, importFromImdbCsv, importProgress, loading, error } = useMediaApi()
const { addItem } = useMediaStore()

const anilistUsername = ref('')
const csvFile = ref<File | null>(null)
const linkPlaceholder = ''

const isAniList = computed(() => props.category === 'anime' || props.category === 'manga')
const modalTitle = computed(() => isAniList.value ? t('import.anilistImport') : t('import.imdbImport'))
const modalSubtitle = computed(() =>
  isAniList.value ? t('import.anilistSubtitle') : t('import.imdbSubtitle'),
)

const canStart = computed(() => {
  if (isAniList.value) return anilistUsername.value.trim().length > 0
  return csvFile.value !== null
})

const progressPercent = computed(() => {
  if (!importProgress.value) return 0
  return Math.round((importProgress.value.current / importProgress.value.total) * 100)
})

function close(): void {
  emit('update:open', false)
}

function onFileSelect(e: Event): void {
  const target = e.target as HTMLInputElement
  csvFile.value = target.files?.[0] ?? null
}

function startImport(): void {
  if (isAniList.value) startAniListImport()
  else startImdbImport()
}

async function startAniListImport(): Promise<void> {
  const username = anilistUsername.value.trim()
  if (!username) return
  const type = props.category === 'anime' ? 'ANIME' as const : 'MANGA' as const
  await importFromAniList(username, type, addItem)
}

async function startImdbImport(): Promise<void> {
  if (!csvFile.value) return
  const text = await csvFile.value.text()
  await importFromImdbCsv(text, addItem)
}

watch(() => props.open, (val) => {
  if (!val) {
    anilistUsername.value = ''
    csvFile.value = null
    importProgress.value = null
    error.value = null
  }
})
</script>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.content-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.content-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.content-enter-from {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
}
.content-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
