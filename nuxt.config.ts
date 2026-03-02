// Nuxt configuration - Rebuild triggered
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxtjs/i18n'],

  i18n: {
    locales: [
      { code: 'tr', name: 'Turkce', file: 'tr.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'tr',
    strategy: 'no_prefix',
    langDir: 'locales',
  },
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'dark'
  },

  runtimeConfig: {
    public: {
      omdbApiKey: '',
      googleClientId: ''
    }
  },

  ssr: false,
  nitro: {
    preset: 'static'
  },

  app: {
    pageTransition: false,
    head: {
      title: 'Media Tracker',
      htmlAttrs: {
        lang: 'tr'
      },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ],
      meta: [
        { name: 'theme-color', content: '#1a1a1a' },
        { name: 'description', content: 'İzlediklerim ve Okuduklarım - Film, Dizi, Anime, Manga Takip' },
        { property: 'og:title', content: 'Media Tracker' },
        { property: 'og:description', content: 'Film, dizi, anime ve manga takip uygulaması.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: '/og-image.png' },
        { property: 'og:locale', content: 'tr_TR' },
        { name: 'author', content: 'Burak Temur' }
      ]
    }
  }
})  