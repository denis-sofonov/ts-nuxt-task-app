import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Pin the Nitro/Nuxt behaviour to a known date so future releases cannot
  // silently change defaults underneath the project.
  compatibilityDate: '2025-06-01',

  // SSR is the whole point of this sample (server-rendered, session-based auth),
  // so it stays on explicitly rather than relying on the default.
  ssr: true,

  devtools: { enabled: true },

  modules: ['@nuxt/eslint', 'shadcn-nuxt', 'nuxt-auth-utils', '@pinia/nuxt'],

  css: ['~/assets/css/main.css'],

  // Tailwind v4 is wired through its Vite plugin rather than the legacy Nuxt
  // module: the v4 engine is configured in CSS (@theme), not a JS config file.
  vite: {
    plugins: [tailwindcss()],
  },

  // shadcn-vue components are generated into the app source tree and owned by
  // this repo (no runtime UI dependency to hide behind).
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },

  typescript: {
    strict: true,
    // Type checking runs as a dedicated `nuxt typecheck` step (and in CI) so the
    // dev server stays fast instead of type-checking on every change.
    typeCheck: false,
  },

  // Formatting is delegated to Prettier; ESLint only enforces correctness rules.
  eslint: {
    config: {
      stylistic: false,
    },
  },

  runtimeConfig: {
    // Server-only. Overridden at runtime by NUXT_DATABASE_URL.
    // The session secret is read by nuxt-auth-utils from NUXT_SESSION_PASSWORD.
    databaseUrl: '',
    // Base URL used to build links in transactional emails.
    appUrl: 'http://localhost:3000',
    mailFrom: 'TaskFlow <no-reply@taskflow.dev>',
    // When smtpHost is empty (dev default) emails are logged instead of sent.
    smtpHost: '',
    smtpPort: '1025',
    // nuxt-auth-utils session cookie. It is sealed + httpOnly by default and
    // marked Secure automatically in production; we set SameSite=Lax explicitly
    // as the first CSRF layer, plus a name and a 7-day lifetime.
    session: {
      name: 'taskflow_session',
      maxAge: 60 * 60 * 24 * 7,
      cookie: {
        sameSite: 'lax',
      },
    },
    public: {
      appName: 'TaskFlow',
    },
  },
})
