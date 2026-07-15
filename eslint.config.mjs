// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import eslintConfigPrettier from 'eslint-config-prettier'

// https://eslint.nuxt.com
export default withNuxt(
  // Never lint the design reference export.
  { ignores: ['design/**'] },
  // Let Prettier own formatting — disable ESLint rules that would conflict.
  eslintConfigPrettier,
)
