export interface AuthUser {
  id: number
  username: string
  email: string
}

interface AuthResponse {
  success: boolean
  token: string
  user: AuthUser
  message?: string
}

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

const user = ref<AuthUser | null>(null)
const token = ref<string | null>(null)
const authLoading = ref(false)
const authReady = ref(false)

let initialized = false

function init(): void {
  if (initialized || !import.meta.client) return
  initialized = true

  token.value = localStorage.getItem(TOKEN_KEY)
  const saved = localStorage.getItem(USER_KEY)
  if (saved) {
    try {
      user.value = JSON.parse(saved)
    }
    catch {
      user.value = null
    }
  }
  authReady.value = true
}

const isAuthenticated = computed(() => !!token.value && !!user.value)

async function login(username: string, password: string): Promise<string | null> {
  authLoading.value = true
  try {
    const data = await $fetch<AuthResponse>('/api/auth/login.php', {
      method: 'POST',
      body: { username, password },
    })

    if (data.success) {
      token.value = data.token
      user.value = data.user
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      return null
    }

    return data.message || 'Giris basarisiz.'
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string }, message?: string }
    return err.data?.message || err.message || 'Bir hata olustu.'
  }
  finally {
    authLoading.value = false
  }
}

async function register(username: string, email: string, password: string): Promise<string | null> {
  authLoading.value = true
  try {
    const data = await $fetch<AuthResponse>('/api/auth/register.php', {
      method: 'POST',
      body: { username, email, password },
    })

    if (data.success) {
      token.value = data.token
      user.value = data.user
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      return null
    }

    return data.message || 'Kayit basarisiz.'
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string }, message?: string }
    return err.data?.message || err.message || 'Bir hata olustu.'
  }
  finally {
    authLoading.value = false
  }
}

function logout(): void {
  token.value = null
  user.value = null
  initialized = false
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  navigateTo('/login')
}

function getAuthHeaders(): Record<string, string> {
  const t = token.value
  return t ? { Authorization: `Bearer ${t}` } : {}
}

export function useAuth() {
  init()
  return {
    user: readonly(user),
    token: readonly(token),
    isAuthenticated,
    authLoading,
    authReady,
    login,
    register,
    logout,
    getAuthHeaders,
  }
}
