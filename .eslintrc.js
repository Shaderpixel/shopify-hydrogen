/**
 * @type {import("@types/eslint").Linter.BaseConfig}
 */
module.exports = {
  extends: [
    'prettier',
    'plugin:hydrogen/recommended',
    'plugin:hydrogen/typescript',
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error'],
  },
};
