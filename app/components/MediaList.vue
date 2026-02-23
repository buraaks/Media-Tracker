<template>
  <div>
    <!-- Grid -->
    <TransitionGroup
      v-if="items.length"
      name="list"
      tag="div"
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
    >
      <MediaCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        @select="$emit('select', $event)"
      />
    </TransitionGroup>

    <!-- Empty State -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <div class="flex items-center justify-center size-16 rounded-2xl bg-white/[0.03] border border-white/6 mb-5">
        <UIcon :name="emptyIcon" class="size-7 text-white/15" />
      </div>
      <p class="text-white/30 text-sm mb-1">{{ $t('media.emptyTitle') }}</p>
      <p class="text-white/20 text-xs">{{ $t('media.emptySubtitle', { category: categoryLabel }) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MediaItem, MediaCategory } from '~/types/media'

const props = defineProps<{
  items: MediaItem[]
  category: MediaCategory
}>()

defineEmits<{
  select: [item: MediaItem]
}>()

const { t } = useI18n()

const iconMap: Record<MediaCategory, string> = {
  film: 'i-lucide-clapperboard',
  dizi: 'i-lucide-tv',
  anime: 'i-lucide-sparkles',
  manga: 'i-lucide-book-open',
}

const labelKeyMap: Record<MediaCategory, string> = {
  film: 'media.categoryFilm',
  dizi: 'media.categorySeries',
  anime: 'media.categoryAnime',
  manga: 'media.categoryManga',
}

const emptyIcon = computed(() => iconMap[props.category])
const categoryLabel = computed(() => t(labelKeyMap[props.category]))
</script>

<style scoped>
.list-enter-active {
  transition: all 0.3s ease;
}
.list-leave-active {
  transition: all 0.2s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.list-move {
  transition: transform 0.3s ease;
}
</style>
