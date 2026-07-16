/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [require.resolve('@coffee-catch/config/eslint/index')],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
