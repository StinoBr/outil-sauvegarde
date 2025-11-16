// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // --- Vos paramètres d'origine ---
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // --- Nos ajouts pour le mode API ---

  // 1. On désactive les composants Vue, car le frontend est React
  components: false,

  devServer: {
    port: 3001
  },

  // 2. Configuration de Nitro (le backend)
  nitro: {
    // On configure le CORS pour autoriser React
    routeRules: {
      // Applique les règles à toutes les routes commençant par /api/
      '/api/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:3000', // Autorise React
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    },
    externals: {
      traceInclude: ['node-cron'],
      external: ['node-cron']
    }
  }
})
