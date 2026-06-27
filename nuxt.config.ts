// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },
  css: ['~/assets/css/main.css'],
  ui: {
    fonts: false
  },

  routeRules: {
    '/': { prerender: false }
  },

  runtimeConfig: {
    authPassword: process.env.AUTH_PASSWORD || 'dev123',
    sessionSecret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
    databaseUrl: process.env.DATABASE_URL || ''
  },

  nitro: {
    preset: 'deno-deploy',
    rollupConfig: {
      external: ['cloudflare:sockets']
    }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
