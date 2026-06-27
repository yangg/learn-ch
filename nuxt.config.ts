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
    authPassword: process.env.AUTH_PASSWORD,
    sessionSecret: process.env.SESSION_SECRET,
    databaseUrl: process.env.DATABASE_URL
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
