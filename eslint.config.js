import tsparser from '@typescript-eslint/parser'

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/*.d.ts', '**/*.config.js', '!**/eslint.config.js', '**/.react-router/**'],
    rules: {
      'no-unused-vars': 'warn',
      'prefer-const': 'error',
    },
    languageOptions: {
      parser: tsparser,
    },
  },
]
