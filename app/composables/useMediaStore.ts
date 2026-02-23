import type { MediaCategory, MediaItem } from '~/types/media'

const STORAGE_KEY = 'media-tracker-items'

const items = ref<MediaItem[]>([])

function persist(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
}

function loadFromStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      items.value = JSON.parse(raw) as MediaItem[]
    }
  } catch {
    items.value = []
  }
}

function getByCategory(category: MediaCategory): ComputedRef<MediaItem[]> {
  return computed(() =>
    items.value
      .filter(item => item.category === category)
      .sort((a, b) => b.addedAt - a.addedAt)
  )
}

function addItem(item: MediaItem): boolean {
  const duplicate = items.value.some(
    existing => existing.title.toLowerCase() === item.title.toLowerCase()
      && existing.category === item.category
  )
  if (duplicate) return false

  items.value.push(item)
  persist()
  return true
}

function removeItem(id: string): void {
  items.value = items.value.filter(item => item.id !== id)
  persist()
}

export function useMediaStore() {
  return {
    items: readonly(items),
    loadFromStorage,
    getByCategory,
    addItem,
    removeItem
  }
}
