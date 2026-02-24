export interface AuthUser {
  id: number
  username: string
  email: string
  email_verified: boolean
}

interface AuthResponse {
  success: boolean
  token: string
  user: AuthUser
  message?: string
  require_password?: boolean
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

async function updateProfile(data: { username: string, email: string, newPassword: string, currentPassword: string }): Promise<string | null> {
  authLoading.value = true
  try {
    const res = await $fetch<AuthResponse>('/api/auth/update.php', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: data,
    })

    if (res.success) {
      token.value = res.token
      user.value = res.user
      localStorage.setItem(TOKEN_KEY, res.token)
      localStorage.setItem(USER_KEY, JSON.stringify(res.user))
      return null
    }

    return res.message || 'Guncelleme basarisiz.'
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
  const { clearItems } = useMediaStore()
  clearItems()
  navigateTo('/')
}

function getAuthHeaders(): Record<string, string> {
  const t = token.value
  return t ? { Authorization: `Bearer ${t}` } : {}
}

async function loginWithGoogle(credential: string, password?: string): Promise<{error: string | null; requirePassword?: boolean}> {
  authLoading.value = true
  try {
    const data = await $fetch<AuthResponse>('/api/auth/google.php', {
      method: 'POST',
      body: { credential, password },
    })

    if (data.success) {
      token.value = data.token
      user.value = data.user
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      return { error: null }
    }

    if (data.require_password) {
      return { error: null, requirePassword: true }
    }

    return { error: data.message || 'Google ile giris basarisiz.' }
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string, require_password?: boolean }, message?: string }
    if (err.data?.require_password) {
      return { error: null, requirePassword: true }
    }
    return { error: err.data?.message || err.message || 'Bir hata olustu.' }
  }
  finally {
    authLoading.value = false
  }
}

async function refreshUser(): Promise<void> {
  if (!token.value) return
  try {
    const data = await $fetch<AuthResponse>('/api/auth/me.php', {
      headers: getAuthHeaders()
    })
    if (data.success && data.user) {
      user.value = data.user
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    }
  } catch (e) {
    // Ignore error, just keep current user details
  }
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
    updateProfile,
    logout,
    getAuthHeaders,
    loginWithGoogle,
    refreshUser,
  }
}
