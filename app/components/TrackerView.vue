<template>
  <div>
    <TheHeader :model-value="category" />

    <div class="max-w-275 mx-auto px-8 py-8 max-sm:px-4 max-sm:py-6">
      <Transition name="page" mode="out-in">
        <div :key="category">
          <!-- Category Title + Import -->
          <div class="flex items-center justify-between mb-6 max-sm:flex-col max-sm:items-start max-sm:gap-3">
            <div class="flex items-center gap-3">
              <h1 class="text-white/90 text-xl font-bold">{{ categoryTitle }}</h1>
              <span
                v-if="filteredItems.length"
                class="px-2 py-0.5 bg-white/5 border border-white/8 rounded-md text-xs text-white/35"
              >
                {{ filteredItems.length }}
              </span>
            </div>

            <button
              class="flex items-center gap-1.5 px-3 py-1.5 max-sm:py-2 max-sm:px-4 text-xs font-medium text-white/40 hover:text-white/70 bg-white/3 hover:bg-white/6 border border-white/6 hover:border-white/10 rounded-lg transition-all duration-200 cursor-pointer"
              @click="importOpen = true"
            >
              <UIcon :name="importIcon" class="size-3.5" />
              {{ importLabel }}
            </button>
          </div>

          <!-- Add Form -->
          <div class="mb-8">
            <AddMediaForm :category="category" />
          </div>

          <!-- Loading -->
          <div v-if="!loaded" class="flex items-center justify-center py-16">
            <UIcon name="i-lucide-loader-2" class="size-6 text-white/20 animate-spin" />
          </div>

          <!-- Media List -->
          <MediaList
            v-else
            :items="filteredItems"
            :category="category"
            @select="openDetail"
          />
        </div>
      </Transition>
    </div>

    <!-- Detail Modal -->
    <MediaDetailModal :open="modalOpen" :item="selectedItem" @update:open="modalOpen = $event" @remove="handleRemove" />

    <!-- Import Modal -->
    <ImportModal :open="importOpen" :category="category" @update:open="importOpen = $event" />
  </div>
</template>

<script setup lang="ts">
import type { MediaCategory, MediaItem } from '~/types/media'

const props = defineProps<{
  category: MediaCategory
}>()

const { t } = useI18n()

const modalOpen = ref(false)
const importOpen = ref(false)
const selectedItem = ref<MediaItem | null>(null)

const { fetchItems, getByCategory, removeItem, loaded } = useMediaStore()

const filteredItems = computed(() => getByCategory(props.category).value)

const categoryTitle = computed(() => {
  const map: Record<MediaCategory, string> = {
    film: t('tracker.myMovies'),
    dizi: t('tracker.mySeries'),
    anime: t('tracker.myAnime'),
    manga: t('tracker.myManga'),
  }
  return map[props.category]
})

const isAniList = computed(() => props.category === 'anime' || props.category === 'manga')
const importIcon = computed(() => isAniList.value ? 'i-lucide-download' : 'i-lucide-file-text')
const importLabel = computed(() => isAniList.value ? t('import.anilistImport') : t('import.imdbImport'))

function openDetail(item: MediaItem): void {
  selectedItem.value = item
  modalOpen.value = true
}

async function handleRemove(id: string): Promise<void> {
  await removeItem(id)
}

onMounted(() => {
  fetchItems()
})
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
