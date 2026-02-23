<template>
  <Teleport to="body">
    <div v-if="open && item" class="fixed inset-0 z-[100]">
      <!-- Overlay -->
      <Transition name="overlay">
        <div
          v-if="open"
          class="absolute inset-0 bg-black/70"
          @click="$emit('update:open', false)"
        />
      </Transition>

      <!-- Content -->
      <Transition name="content" appear>
        <div
          v-if="open"
          class="absolute inset-0 flex items-center justify-center p-4 pointer-events-none"
        >
          <div class="relative w-full max-w-lg bg-[#1c1c1c] border border-white/8 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.5)] overflow-hidden max-h-[calc(100dvh-2rem)] pointer-events-auto">
            <!-- Close -->
            <button
              class="absolute top-3 right-3 z-10 flex items-center justify-center size-8 rounded-lg bg-black/40 backdrop-blur-sm border border-white/8 transition-all duration-200 hover:bg-white/10 cursor-pointer"
              @click="$emit('update:open', false)"
            >
              <UIcon name="i-lucide-x" class="size-4 text-white/60" />
            </button>

            <!-- Poster Banner -->
            <div class="relative h-48 bg-white/5 overflow-hidden">
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.title"
                class="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm scale-110"
              >
              <div class="absolute inset-0 bg-gradient-to-t from-[#1c1c1c] via-[#1c1c1c]/60 to-transparent" />
              <div class="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-4">
                <img
                  v-if="item.image"
                  :src="item.image"
                  :alt="item.title"
                  class="w-20 h-28 object-cover rounded-lg border border-white/10 shadow-lg shrink-0"
                >
                <div class="min-w-0">
                  <h2 class="text-white font-bold text-lg leading-snug line-clamp-2">{{ item.title }}</h2>
                  <div class="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span v-if="item.year !== '-'" class="text-white/45 text-sm">{{ item.year }}</span>
                    <span v-if="item.score !== '-'" class="flex items-center gap-1 text-sm">
                      <UIcon name="i-lucide-star" class="size-3.5 text-amber-400" />
                      <span class="text-amber-300/80">{{ item.score }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Details -->
            <div class="p-6 space-y-4 overflow-y-auto max-h-[calc(100dvh-2rem-12rem)]">
              <div v-if="item.genre" class="flex flex-wrap gap-1.5">
                <span
                  v-for="g in item.genre.split(',')"
                  :key="g"
                  class="px-2.5 py-1 bg-white/5 border border-white/6 rounded-md text-xs text-white/50"
                >
                  {{ g.trim() }}
                </span>
              </div>

              <p v-if="item.extra" class="text-white/40 text-sm">
                {{ item.extra }}
              </p>

              <p v-if="item.plot" class="text-white/55 text-sm leading-relaxed">
                {{ item.plot }}
              </p>

              <p v-if="!item.plot && !item.genre && !item.extra" class="text-white/25 text-sm italic">
                Detay bilgisi bulunmuyor.
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { MediaItem } from '~/types/media'

defineProps<{
  open: boolean
  item: MediaItem | null
}>()

defineEmits<{
  'update:open': [value: boolean]
}>()
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
