import type {
  MediaCategory, MediaItem, OmdbResponse, AniListResponse,
  AniListMedia, AniListUserListResponse, ImdbCsvRow, ImportProgress,
  OmdbSearchResponse, AniListPageResponse, SearchResult,
} from '~/types/media'

const ANILIST_ENDPOINT = 'https://graphql.anilist.co'

const ANIME_QUERY = `
query ($search: String) {
  Media(search: $search, type: ANIME) {
    title { romaji english }
    episodes
    averageScore
    seasonYear
    coverImage { large }
    genres
    description
  }
}`

const MANGA_QUERY = `
query ($search: String) {
  Media(search: $search, type: MANGA) {
    title { romaji english }
    chapters
    averageScore
    startDate { year }
    coverImage { large }
    genres
    description
  }
}`

const ANIME_PAGE_QUERY = `
query ($search: String) {
  Page(page: 1, perPage: 5) {
    media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
      title { romaji english }
      episodes
      averageScore
      seasonYear
      coverImage { large }
      genres
      description
    }
  }
}`

const MANGA_PAGE_QUERY = `
query ($search: String) {
  Page(page: 1, perPage: 5) {
    media(search: $search, type: MANGA, sort: SEARCH_MATCH) {
      title { romaji english }
      chapters
      averageScore
      startDate { year }
      coverImage { large }
      genres
      description
    }
  }
}`

const ANILIST_USER_LIST_QUERY = `
query ($username: String, $type: MediaType) {
  MediaListCollection(userName: $username, type: $type) {
    lists {
      name
      entries {
        media {
          title { romaji english }
          episodes
          chapters
          averageScore
          seasonYear
          startDate { year }
          coverImage { large }
          genres
          description
        }
      }
    }
  }
}`

function generateId(title: string, category: MediaCategory): string {
  return `${category}-${title.toLowerCase().replace(/\s+/g, '-')}`
}

function normalizeAniListMedia(media: AniListMedia, type: 'ANIME' | 'MANGA'): MediaItem {
  const category: MediaCategory = type === 'ANIME' ? 'anime' : 'manga'
  const title = media.title.english || media.title.romaji
  const year = type === 'ANIME'
    ? (media.seasonYear?.toString() ?? '-')
    : (media.startDate?.year?.toString() ?? '-')
  const score = media.averageScore ? (media.averageScore / 10).toFixed(1) : '-'

  let extra = ''
  if (type === 'ANIME' && media.episodes) {
    extra = `${media.episodes} Bolum`
  } else if (type === 'MANGA' && media.chapters) {
    extra = `${media.chapters} Bolum`
  }
  if (media.genres?.length) {
    extra = extra ? `${extra} · ${media.genres.slice(0, 3).join(', ')}` : media.genres.slice(0, 3).join(', ')
  }

  const rawDesc = media.description ?? undefined
  const plot = rawDesc ? rawDesc.replace(/<[^>]*>/g, '') : undefined

  return {
    id: generateId(title, category),
    title,
    year,
    score,
    image: media.coverImage.large,
    extra,
    category,
    plot,
    genre: media.genres?.join(', '),
    addedAt: Date.now()
  }
}

async function searchOmdb(query: string, type: 'movie' | 'series'): Promise<MediaItem> {
  const config = useRuntimeConfig()
  const apiKey = config.public.omdbApiKey

  if (!apiKey) {
    throw new Error('OMDb API anahtari bulunamadi. .env dosyasina NUXT_PUBLIC_OMDB_API_KEY ekleyin.')
  }

  const data = await $fetch<OmdbResponse>('https://www.omdbapi.com/', {
    params: { apikey: apiKey, t: query, type }
  })

  if (data.Response === 'False') {
    throw new Error(data.Error || 'Icerik bulunamadi.')
  }

  const returnedType = data.Type?.toLowerCase()
  if (returnedType !== type) {
    const expected = type === 'movie' ? 'film' : 'dizi'
    const got = returnedType === 'movie' ? 'bir film' : 'bir dizi'
    throw new Error(`"${data.Title}" ${got}, ${expected} degil. Dogru sekmeyi kullanin.`)
  }

  const category: MediaCategory = type === 'movie' ? 'film' : 'dizi'

  return {
    id: generateId(data.Title, category),
    title: data.Title,
    year: data.Year,
    score: data.imdbRating !== 'N/A' ? data.imdbRating : '-',
    image: data.Poster !== 'N/A' ? data.Poster : '',
    extra: data.Genre,
    category,
    plot: data.Plot !== 'N/A' ? data.Plot : undefined,
    genre: data.Genre !== 'N/A' ? data.Genre : undefined,
    addedAt: Date.now()
  }
}

async function searchOmdbById(imdbId: string): Promise<OmdbResponse> {
  const config = useRuntimeConfig()
  const apiKey = config.public.omdbApiKey

  if (!apiKey) {
    throw new Error('OMDb API anahtari bulunamadi.')
  }

  return await $fetch<OmdbResponse>('https://www.omdbapi.com/', {
    params: { apikey: apiKey, i: imdbId }
  })
}

async function searchOmdbMultiple(query: string, type: 'movie' | 'series', category: MediaCategory): Promise<SearchResult[]> {
  const config = useRuntimeConfig()
  const apiKey = config.public.omdbApiKey
  if (!apiKey) return []

  const data = await $fetch<OmdbSearchResponse>('https://www.omdbapi.com/', {
    params: { apikey: apiKey, s: query, type },
  })

  if (data.Response === 'False' || !data.Search) return []

  return data.Search.slice(0, 5).map(item => ({
    title: item.Title,
    year: item.Year,
    image: item.Poster !== 'N/A' ? item.Poster : '',
    category,
    imdbId: item.imdbID,
  }))
}

async function searchAniListMultiple(query: string, type: 'ANIME' | 'MANGA'): Promise<SearchResult[]> {
  const gqlQuery = type === 'ANIME' ? ANIME_PAGE_QUERY : MANGA_PAGE_QUERY

  const response = await $fetch<AniListPageResponse>(ANILIST_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: { query: gqlQuery, variables: { search: query } },
  })

  if (response.errors?.length || !response.data?.Page?.media) return []

  return response.data.Page.media.map((media) => {
    const fullItem = normalizeAniListMedia(media, type)
    return {
      title: fullItem.title,
      year: fullItem.year,
      image: fullItem.image,
      category: fullItem.category,
      fullItem,
    }
  })
}

async function searchAniList(query: string, type: 'ANIME' | 'MANGA'): Promise<MediaItem> {
  const gqlQuery = type === 'ANIME' ? ANIME_QUERY : MANGA_QUERY

  const response = await $fetch<AniListResponse>(ANILIST_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: { query: gqlQuery, variables: { search: query } }
  })

  if (response.errors?.length) {
    throw new Error(response.errors[0].message)
  }

  const media = response.data?.Media
  if (!media) {
    throw new Error('Icerik bulunamadi.')
  }

  return normalizeAniListMedia(media, type)
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  fields.push(current.trim())
  return fields
}

function parseImdbCsv(csvText: string): ImdbCsvRow[] {
  const lines = csvText.split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  const headers = parseCsvLine(lines[0])
  const constIdx = headers.indexOf('Const')
  const titleIdx = headers.indexOf('Title')
  const typeIdx = headers.indexOf('Title Type')
  const yearIdx = headers.indexOf('Year')
  const ratingIdx = headers.indexOf('IMDb Rating')
  const genresIdx = headers.indexOf('Genres')

  if (constIdx === -1 || titleIdx === -1) {
    throw new Error('Gecersiz IMDb CSV formati. IMDb watchlist export dosyanizi kullanin.')
  }

  return lines.slice(1).map(line => {
    const fields = parseCsvLine(line)
    return {
      imdbId: fields[constIdx] || '',
      title: fields[titleIdx] || '',
      titleType: fields[typeIdx] || '',
      year: fields[yearIdx] || '',
      imdbRating: fields[ratingIdx] || '',
      genres: fields[genresIdx] || ''
    }
  }).filter(row => row.imdbId && row.title)
}

function imdbTypeToCategory(titleType: string): MediaCategory | null {
  const t = titleType.toLowerCase()
  if (['movie', 'short', 'tvmovie', 'video'].includes(t)) return 'film'
  if (['tvseries', 'tvminiseries'].includes(t)) return 'dizi'
  return null
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export function useMediaApi() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const importProgress = ref<ImportProgress | null>(null)

  const searchLoading = ref(false)

  async function searchMultiple(query: string, category: MediaCategory): Promise<SearchResult[]> {
    searchLoading.value = true
    try {
      switch (category) {
        case 'film':
          return await searchOmdbMultiple(query, 'movie', 'film')
        case 'dizi':
          return await searchOmdbMultiple(query, 'series', 'dizi')
        case 'anime':
          return await searchAniListMultiple(query, 'ANIME')
        case 'manga':
          return await searchAniListMultiple(query, 'MANGA')
      }
    }
    catch {
      return []
    }
    finally {
      searchLoading.value = false
    }
  }

  async function selectResult(result: SearchResult): Promise<MediaItem | null> {
    if (result.fullItem) return result.fullItem

    if (result.imdbId) {
      loading.value = true
      error.value = null
      try {
        const data = await searchOmdbById(result.imdbId)
        if (data.Response === 'False') {
          error.value = data.Error || 'Icerik bulunamadi.'
          return null
        }
        const category = result.category
        return {
          id: generateId(data.Title, category),
          title: data.Title,
          year: data.Year,
          score: data.imdbRating !== 'N/A' ? data.imdbRating : '-',
          image: data.Poster !== 'N/A' ? data.Poster : '',
          extra: data.Genre,
          category,
          plot: data.Plot !== 'N/A' ? data.Plot : undefined,
          genre: data.Genre !== 'N/A' ? data.Genre : undefined,
          addedAt: Date.now(),
        }
      }
      catch (e: unknown) {
        error.value = e instanceof Error ? e.message : 'Bir hata olustu.'
        return null
      }
      finally {
        loading.value = false
      }
    }

    return null
  }

  async function searchMedia(query: string, category: MediaCategory): Promise<MediaItem | null> {
    loading.value = true
    error.value = null

    try {
      switch (category) {
        case 'film':
          return await searchOmdb(query, 'movie')
        case 'dizi':
          return await searchOmdb(query, 'series')
        case 'anime':
          return await searchAniList(query, 'ANIME')
        case 'manga':
          return await searchAniList(query, 'MANGA')
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Bilinmeyen bir hata olustu.'
      return null
    } finally {
      loading.value = false
    }
  }

  async function importFromAniList(
    username: string,
    type: 'ANIME' | 'MANGA',
    addItem: (item: MediaItem) => boolean | Promise<boolean>,
  ): Promise<void> {
    loading.value = true
    error.value = null
    importProgress.value = null

    try {
      const response = await $fetch<AniListUserListResponse>(ANILIST_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: { query: ANILIST_USER_LIST_QUERY, variables: { username, type } }
      })

      if (response.errors?.length) {
        throw new Error(response.errors[0].message)
      }

      const collection = response.data?.MediaListCollection
      if (!collection?.lists?.length) {
        throw new Error(`"${username}" kullanicisi icin ${type.toLowerCase()} listesi bulunamadi.`)
      }

      const allEntries = collection.lists.flatMap(list => list.entries)

      importProgress.value = {
        total: allEntries.length,
        current: 0,
        imported: 0,
        skipped: 0,
        failed: 0,
        currentTitle: ''
      }

      for (const entry of allEntries) {
        const media = entry.media
        const title = media.title.english || media.title.romaji
        importProgress.value.current++
        importProgress.value.currentTitle = title

        try {
          const item = normalizeAniListMedia(media, type)
          const added = await addItem(item)
          if (added) {
            importProgress.value.imported++
          } else {
            importProgress.value.skipped++
          }
        } catch {
          importProgress.value.failed++
        }
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'AniList listesi alinamadi.'
    } finally {
      loading.value = false
    }
  }

  async function importFromImdbCsv(
    csvText: string,
    addItem: (item: MediaItem) => boolean | Promise<boolean>,
  ): Promise<void> {
    loading.value = true
    error.value = null
    importProgress.value = null

    try {
      const rows = parseImdbCsv(csvText)
      if (!rows.length) {
        throw new Error('CSV dosyasinda icerik bulunamadi.')
      }

      importProgress.value = {
        total: rows.length,
        current: 0,
        imported: 0,
        skipped: 0,
        failed: 0,
        currentTitle: ''
      }

      for (const row of rows) {
        importProgress.value.current++
        importProgress.value.currentTitle = row.title

        const category = imdbTypeToCategory(row.titleType)
        if (!category) {
          importProgress.value.skipped++
          continue
        }

        try {
          const data = await searchOmdbById(row.imdbId)

          if (data.Response === 'False') {
            importProgress.value.failed++
            continue
          }

          const item: MediaItem = {
            id: generateId(data.Title, category),
            title: data.Title,
            year: data.Year,
            score: data.imdbRating !== 'N/A' ? data.imdbRating : '-',
            image: data.Poster !== 'N/A' ? data.Poster : '',
            extra: data.Genre,
            category,
            plot: data.Plot !== 'N/A' ? data.Plot : undefined,
            genre: data.Genre !== 'N/A' ? data.Genre : undefined,
            addedAt: Date.now()
          }

          const added = await addItem(item)
          if (added) {
            importProgress.value.imported++
          } else {
            importProgress.value.skipped++
          }

          await delay(250)
        } catch {
          importProgress.value.failed++
        }
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'CSV import basarisiz oldu.'
    } finally {
      loading.value = false
    }
  }

  return {
    searchMedia,
    searchMultiple,
    selectResult,
    importFromAniList,
    importFromImdbCsv,
    importProgress,
    searchLoading,
    loading,
    error,
  }
}
