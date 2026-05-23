// Flat ESLint config generated and extended through @nuxt/eslint.
// `withNuxt` injects the project-aware Nuxt/Vue/TypeScript rule set; we layer a
// few project rules on top and let eslint-config-prettier turn off everything
// that would fight with Prettier formatting.
import withNuxt from './.nuxt/eslint.config.mjs'
import eslintConfigPrettier from 'eslint-config-prettier'

export default withNuxt(
  {
    rules: {
      // Single-file pages/layouts are intentionally single-word in Nuxt.
      'vue/multi-word-component-names': 'off',
    },
  },
  eslintConfigPrettier,
)
