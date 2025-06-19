// This file is used to configure i18next-scanner, a tool for extracting translation keys from codebase.

module.exports = {
  input: [
    'app/**/*.{ts,tsx}',
    '!app/**/*.spec.{ts,tsx}',
    '!locales/**',
    '!**/node_modules/**',
  ],
  output: "./",
  options: {
    debug: true,
    func: {
      list: ["t", "i18next.t", "i18n.t"],
      extensions: [".ts", ".tsx"],
    },
    trans: true,
    lngs: ["en", "pt"],
    defaultLng: "en",
    defaultNs: "translation",
    defaultValue: '__STRING_NOT_TRANSLATED__',
    resetDefaultValue: false,
    removeUnusedKeys: true,
    resource: {
      loadPath: "./locales/{{lng}}/{{ns}}.json",
      savePath: "./locales/{{lng}}/{{ns}}.json",
      jsonIndent: 2,
      lineEnding: '\n'
    },
    nsSeparator: false, // namespace separator
    keySeparator: false, // key separator
    interpolation: {
        prefix: '{{',
        suffix: '}}'
    },
    metadata: {},
    allowDynamicKeys: false,
  },
};