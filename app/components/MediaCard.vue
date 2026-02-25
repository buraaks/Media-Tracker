<template>
  <div
    class="group relative flex h-[148px] max-sm:h-[130px] bg-white/3 border border-white/6 rounded-xl overflow-hidden transition-all duration-300 hover:bg-white/6 hover:border-white/10 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] cursor-pointer"
    @click="$emit('select', item)"
  >
    <!-- Poster -->
    <div
      class="relative w-[110px] shrink-0 bg-white/5 overflow-hidden max-sm:w-[90px]"
    >
      <img
        v-if="item.image"
        :src="item.image"
        :alt="item.title"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        @error="onImageError"
      />
      <div v-else class="absolute inset-0 flex items-center justify-center">
        <UIcon name="i-lucide-image-off" class="size-8 text-white/15" />
      </div>
    </div>

    <!-- Info -->
    <div class="flex-1 p-4 flex flex-col gap-2 min-w-0 max-sm:p-3">
      <h3
        class="text-white/90 font-semibold text-[15px] leading-snug line-clamp-2 group-hover:text-white transition-colors"
      >
        {{ item.title }}
      </h3>

      <div class="flex items-center gap-3 flex-wrap">
        <span v-if="item.year !== '-'" class="text-white/40 text-xs">{{
          item.year
        }}</span>

        <span v-if="item.score !== '-'" class="flex items-center gap-1 text-xs">
          <UIcon name="i-lucide-star" class="size-3 text-amber-400" />
          <span class="text-amber-300/80">{{ item.score }}</span>
        </span>
      </div>

      <p
        v-if="item.extra"
        class="text-white/35 text-xs leading-relaxed line-clamp-2 mt-auto"
      >
        {{ item.extra }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MediaItem } from "~/types/media";

defineProps<{
  item: MediaItem;
}>();

defineEmits<{
  select: [item: MediaItem];
}>();

function onImageError(e: Event): void {
  const img = e.target as HTMLImageElement;
  img.style.display = "none";
}
</script>
