import type { MediaCategory, MediaItem } from '~/types/media'

const items = ref<MediaItem[]>([])
const loaded = ref(false)

function getByCategory(category: MediaCategory): ComputedRef<MediaItem[]> {
  return computed(() =>
    items.value
      .filter(item => item.category === category)
      .sort((a, b) => b.addedAt - a.addedAt),
  )
}

async function fetchItems(): Promise<void> {
  const { getAuthHeaders, isAuthenticated } = useAuth()
  if (!isAuthenticated.value) return

  try {
    const data = await $fetch<{ success: boolean, items: MediaItem[] }>('/api/media/list.php', {
      headers: getAuthHeaders(),
    })
    if (data.success) {
      items.value = data.items
    }
  }
  catch {
    items.value = []
  }
  finally {
    loaded.value = true
  }
}

async function addItem(item: MediaItem): Promise<boolean> {
  const { getAuthHeaders, isAuthenticated } = useAuth()
  if (!isAuthenticated.value) return false

  const duplicate = items.value.some(
    existing => existing.title.toLowerCase() === item.title.toLowerCase()
      && existing.category === item.category,
  )
  if (duplicate) return false

  try {
    await $fetch('/api/media/add.php', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: item,
    })
    items.value.push(item)
    return true
  }
  catch {
    return false
  }
}

async function removeItem(id: string): Promise<void> {
  const { getAuthHeaders } = useAuth()

  try {
    await $fetch('/api/media/delete.php', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: { id },
    })
    items.value = items.value.filter(item => item.id !== id)
  }
  catch {
    // silently fail – item stays in the list
  }
}

async function updateNotes(id: string, notes: string): Promise<void> {
  const { getAuthHeaders } = useAuth()
  const item = items.value.find(i => i.id === id)
  if (item) item.notes = notes

  try {
    await $fetch('/api/media/update.php', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: { id, notes },
    })
  }
  catch {
    // API basarisiz olsa bile lokal guncelleme kalir
  }
}

function clearItems(): void {
  items.value = []
  loaded.value = false
}

export function useMediaStore() {
  return {
    items: readonly(items),
    loaded: readonly(loaded),
    fetchItems,
    getByCategory,
    addItem,
    removeItem,
    updateNotes,
    clearItems,
  }
}
