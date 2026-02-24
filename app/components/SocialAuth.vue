<template>
  <div class="space-y-4 mt-6">
    <div class="relative flex py-2 items-center">
      <div class="grow border-t border-white/10"></div>
      <span class="shrink-0 mx-4 text-white/30 text-xs">{{ $t('auth.orContinueWith') || 'Veya şunlarla devam et' }}</span>
      <div class="grow border-t border-white/10"></div>
    </div>
    
    <div v-if="requiresPassword" class="space-y-3">
      <p class="text-sm text-white/80 text-center">Hesabınızı tamamlamak için bir şifre belirleyin.</p>
      <input v-model="newPassword" type="password" placeholder="Şifreniz" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all text-sm" />
      <button type="button" @click="submitGoogleWithPassword" class="w-full py-3 bg-white text-black font-medium rounded-xl text-sm hover:bg-white/90 transition-all flex justify-center items-center" :disabled="authLoading">
        <UIcon v-if="authLoading" name="i-lucide-loader-2" class="size-4 animate-spin mr-2" />
        <span>Tamamla</span>
      </button>
      <button type="button" @click="cancelPassword" class="w-full py-2 text-white/50 hover:text-white/80 text-sm transition-all">İptal</button>
    </div>

    <button v-else type="button" @click="handleGoogleLogin" class="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 border border-white/8 rounded-lg text-sm text-white/90 transition-all duration-200 cursor-pointer">
      <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M47.532 24.5528C47.532 22.9214 47.3997 18.2829 46.5413 16.2736H24.5V28.783H37.8927C37.5218 31.9079 35.1396 36.3195 31.1408 39.0298L31.1166 39.1834L38.384 44.8159L38.8876 44.8665C43.5352 40.5847 47.532 33.3934 47.532 24.5528Z" fill="#4285F4"/>
        <path d="M24.5 48.0016C30.9757 48.0016 36.4168 45.8582 40.4578 42.1648L32.7483 36.5619C30.6841 37.9866 27.9405 38.966 24.5 38.966C18.1574 38.966 12.7844 34.7176 10.8715 28.9839L10.7259 28.9961L3.18431 34.8329L3.13324 34.9723C7.07008 42.7937 15.1585 48.0016 24.5 48.0016Z" fill="#34A853"/>
        <path d="M10.8716 28.9839C10.3692 27.5025 10.0784 26.0211 10.0784 24.5133C10.0784 23.0055 10.3692 21.524 10.8451 20.0427L10.8384 19.8732L3.2384 13.978L3.13333 14.0538C1.51908 17.2801 0.592896 20.81 0.592896 24.5133C0.592896 28.2166 1.51908 31.7465 3.13333 34.9728L10.8716 28.9839Z" fill="#FBBC05"/>
        <path d="M24.5 10.0631C28.8524 10.0631 31.8163 11.9688 33.457 13.4776L40.643 6.46337C36.3903 2.5201 30.9493 0 24.5 0C15.1585 0 7.07008 5.2079 3.13324 13.0293L10.845 19.0182C12.7844 13.2845 18.1574 10.0631 24.5 10.0631Z" fill="#EB4335"/>
      </svg>
      Google
    </button>

    <Transition name="fade">
      <div v-if="errorMsg" class="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
        <UIcon name="i-lucide-alert-circle" class="size-4 text-red-400 shrink-0" />
        <span class="text-xs text-red-300">{{ errorMsg }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { loginWithGoogle, authLoading } = useAuth()
const config = useRuntimeConfig()
const errorMsg = ref('')

const requiresPassword = ref(false)
const pendingCredential = ref('')
const newPassword = ref('')

useHead({
  script: [
    { src: 'https://accounts.google.com/gsi/client', async: true, defer: true }
  ]
})

function cancelPassword() {
  requiresPassword.value = false
  pendingCredential.value = ''
  newPassword.value = ''
  errorMsg.value = ''
}

async function submitGoogleWithPassword() {
  if (!newPassword.value) {
    errorMsg.value = 'Lütfen bir şifre girin.'
    return
  }
  if (newPassword.value.length < 6) {
    errorMsg.value = 'Şifre en az 6 karakter olmalıdır.'
    return
  }

  errorMsg.value = ''
  const res = await loginWithGoogle(pendingCredential.value, newPassword.value)
  if (res.error) {
    errorMsg.value = res.error
  } else if (!res.requirePassword) {
    navigateTo('/tracker')
  }
}

function handleGoogleLogin() {
  const clientId = config.public.googleClientId as string || 'your_google_client_id_here'
  if (clientId === 'your_google_client_id_here' || !clientId) {
    errorMsg.value = 'Google Client ID yapilandirilmamis.'
    return
  }
  
  if ((window as any).google) {
    (window as any).google.accounts.id.initialize({
      client_id: clientId,
      callback: async (res: any) => {
        errorMsg.value = ''
        const result = await loginWithGoogle(res.credential)
        if (result.error) {
           errorMsg.value = result.error
        } else if (result.requirePassword) {
           requiresPassword.value = true
           pendingCredential.value = res.credential
        } else {
           navigateTo('/tracker')
        }
      }
    })
    ;(window as any).google.accounts.id.prompt()
  } else {
    errorMsg.value = 'Google servisine ulasilamadi.'
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
