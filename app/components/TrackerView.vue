<template>
  <div class="h-full flex flex-col overflow-hidden">
    <!-- Static Header Part -->
    <div class="shrink-0 w-full max-w-275 mx-auto px-8 pt-8 pb-4 max-sm:px-4 max-sm:pt-6">
      <div class="flex items-center justify-between gap-6 max-sm:flex-col max-sm:items-stretch max-sm:gap-4">
        <!-- Category Title + Count -->
        <div class="flex items-center gap-3 shrink-0">
          <h1 class="text-white/90 text-xl font-bold whitespace-nowrap">{{ categoryTitle }}</h1>
          <span
            v-if="filteredItems.length"
            class="px-2 py-0.5 bg-white/5 border border-white/8 rounded-md text-xs text-white/35"
          >
            {{ filteredItems.length }}
          </span>
        </div>

        <!-- Add Form (Arama Çubuğu) -->
        <div class="flex-1 max-w-md">
          <AddMediaForm :category="category" />
        </div>
      </div>
    </div>

    <!-- Scrollable Content Part -->
    <div class="flex-1 overflow-y-auto custom-scrollbar px-8 pb-8 max-sm:px-4">
      <div class="max-w-275 mx-auto">
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
    </div>

    <!-- Detail Modal -->
    <MediaDetailModal :open="modalOpen" :item="selectedItem" @update:open="modalOpen = $event" @remove="handleRemove" />
  </div>
</template>

<script setup lang="ts">
import type { MediaCategory, MediaItem } from '~/types/media'

const props = defineProps<{
  category: MediaCategory
}>()

const { t } = useI18n()

const modalOpen = ref(false)
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
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
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
