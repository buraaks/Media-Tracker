<template>
  <form class="flex gap-3 max-sm:flex-col" @submit.prevent="handleSubmit">
    <div class="relative flex-1">
      <UIcon
        name="i-lucide-search"
        class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/30 pointer-events-none"
      />
      <input
        v-model="query"
        type="text"
        :placeholder="placeholder"
        :disabled="loading"
        class="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/8 rounded-lg text-sm text-white/90 placeholder-white/30 outline-none transition-all duration-200 focus:border-primary-500/40 focus:bg-white/7 disabled:opacity-50"
        @keydown.enter.prevent="handleSubmit"
      >
    </div>
    <button
      type="submit"
      :disabled="!query.trim() || loading"
      class="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-white/8 disabled:text-white/25 text-white text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer disabled:cursor-not-allowed active:scale-[0.97] shrink-0"
    >
      <UIcon
        v-if="loading"
        name="i-lucide-loader-2"
        class="size-4 animate-spin"
      />
      <UIcon
        v-else
        name="i-lucide-plus"
        class="size-4"
      />
      Ekle
    </button>
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
</template>

<script setup lang="ts">
import type { MediaCategory } from '~/types/media'

const props = defineProps<{
  category: MediaCategory
}>()

const emit = defineEmits<{
  added: []
}>()

const { searchMedia, loading, error } = useMediaApi()
const { addItem } = useMediaStore()

const query = ref('')
const duplicateWarning = ref('')

const placeholders: Record<MediaCategory, string> = {
  film: 'Film adı girin... (ör: Inception)',
  dizi: 'Dizi adı girin... (ör: Breaking Bad)',
  anime: 'Anime adı girin... (ör: Death Note)',
  manga: 'Manga adı girin... (ör: Berserk)'
}

const placeholder = computed(() => placeholders[props.category])

async function handleSubmit(): Promise<void> {
  const trimmed = query.value.trim()
  if (!trimmed || loading.value) return

  duplicateWarning.value = ''

  const item = await searchMedia(trimmed, props.category)
  if (!item) return

  const added = addItem(item)
  if (!added) {
    duplicateWarning.value = `"${item.title}" zaten listenizde mevcut.`
    return
  }

  query.value = ''
  emit('added')
}

watch(() => props.category, () => {
  duplicateWarning.value = ''
  error.value = null
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
</style>
