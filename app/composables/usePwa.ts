export const usePwa = () => {
  const installPrompt = useState<any>('pwa_install_prompt', () => null)

  const isStandalone = computed(() => {
    if (import.meta.server) return false
    return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
  })

  const canInstall = computed(() => !!installPrompt.value)

  async function install() {
    if (!installPrompt.value) return false
    
    installPrompt.value.prompt()
    const { outcome } = await installPrompt.value.userChoice
    
    if (outcome === 'accepted') {
      installPrompt.value = null
      return true
    }
    return false
  }

  return {
    installPrompt,
    isStandalone,
    canInstall,
    install
  }
}
