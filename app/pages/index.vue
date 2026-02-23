<template>
  <div>
    <TheHeader v-model="activeCategory" />

    <div class="max-w-275 mx-auto px-8 py-8 max-sm:px-4 max-sm:py-6">
      <!-- Category Title + Import -->
      <div class="flex items-center justify-between mb-6">
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
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/40 hover:text-white/70 bg-white/[0.03] hover:bg-white/[0.06] border border-white/6 hover:border-white/10 rounded-lg transition-all duration-200 cursor-pointer"
          @click="importOpen = true"
        >
          <UIcon :name="importIcon" class="size-3.5" />
          {{ importLabel }}
        </button>
      </div>

      <!-- Add Form -->
      <div class="mb-8">
        <AddMediaForm :category="activeCategory" @added="onAdded" />
      </div>

      <!-- Loading -->
      <div v-if="!loaded" class="flex items-center justify-center py-16">
        <UIcon name="i-lucide-loader-2" class="size-6 text-white/20 animate-spin" />
      </div>

      <!-- Media List -->
      <MediaList
        v-else
        :items="filteredItems"
        :category="activeCategory"
        @select="openDetail"
        @remove="handleRemove"
      />
    </div>

    <!-- Detail Modal -->
    <MediaDetailModal :open="modalOpen" :item="selectedItem" @update:open="modalOpen = $event" />

    <!-- Import Modal -->
    <ImportModal :open="importOpen" :category="activeCategory" @update:open="importOpen = $event" />
  </div>
</template>

<script setup lang="ts">
import type { MediaCategory, MediaItem } from '~/types/media'

const activeCategory = ref<MediaCategory>('film')
const modalOpen = ref(false)
const importOpen = ref(false)
const selectedItem = ref<MediaItem | null>(null)

const { fetchItems, getByCategory, removeItem, loaded } = useMediaStore()

const filteredItems = computed(() => getByCategory(activeCategory.value).value)

const titleMap: Record<MediaCategory, string> = {
  film: 'Filmlerim',
  dizi: 'Dizilerim',
  anime: 'Animelerim',
  manga: 'Mangalarim',
}

const categoryTitle = computed(() => titleMap[activeCategory.value])

const isAniList = computed(() => activeCategory.value === 'anime' || activeCategory.value === 'manga')
const importIcon = computed(() => isAniList.value ? 'i-lucide-download' : 'i-lucide-file-text')
const importLabel = computed(() => isAniList.value ? 'AniList Import' : 'IMDb Import')

function openDetail(item: MediaItem): void {
  selectedItem.value = item
  modalOpen.value = true
}

async function handleRemove(id: string): Promise<void> {
  await removeItem(id)
}

function onAdded(): void {
  // placeholder for future toast/animation
}

onMounted(() => {
  fetchItems()
})
</script>
