export type MediaCategory = 'film' | 'dizi' | 'anime' | 'manga'

export interface MediaItem {
  id: string
  title: string
  year: string
  score: string
  image: string
  extra: string
  category: MediaCategory
  plot?: string
  genre?: string
  addedAt: number
  // status?: 'watched' | 'watching' | 'plan_to_watch' | 'dropped'
}

export interface OmdbResponse {
  Response: 'True' | 'False'
  Error?: string
  Title: string
  Year: string
  Poster: string
  imdbRating: string
  Genre: string
  Plot: string
  Type: string
}

export interface AniListMedia {
  title: { romaji: string; english: string | null }
  episodes?: number | null
  chapters?: number | null
  averageScore?: number | null
  seasonYear?: number | null
  startDate?: { year: number | null }
  coverImage: { large: string }
  genres?: string[]
  description?: string | null
}

export interface AniListResponse {
  data: {
    Media: AniListMedia | null
  }
  errors?: Array<{ message: string }>
}

export interface CategoryTab {
  key: MediaCategory
  label: string
  icon: string
}

export interface AniListUserListResponse {
  data: {
    MediaListCollection: {
      lists: Array<{
        name: string
        entries: Array<{
          media: AniListMedia
        }>
      }>
    } | null
  }
  errors?: Array<{ message: string }>
}

export interface ImdbCsvRow {
  imdbId: string
  title: string
  titleType: string
  year: string
  imdbRating: string
  genres: string
}

export interface ImportProgress {
  total: number
  current: number
  imported: number
  skipped: number
  failed: number
  currentTitle: string
}
