export default {
  input: ['app/**/*.{js,jsx,ts,tsx}'],
  locales: ['en', 'pt'],
  output: './locales/$LOCALE/$NAMESPACE.json',
  defaultNamespace: 'translation',
  keySeparator: true,
  namespaceSeparator: false,
  useKeysAsDefaultValue: true,
  defaultValue: "__STRING_NOT_TRANSLATED__",
  interpolation: {
    prefix: '{{',
    suffix: '}}'
  },
  react: {
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
    removeExtraWhitespaces: true
  }
};
