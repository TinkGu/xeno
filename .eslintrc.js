module.exports = {
  root: true,
  extends: ['react-ts-sonar'],
  rules: {
    'no-console': 'error',
  },
  overrides: [
    {
      files: ['**/docs/**/*', '**/scripts/**/*'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
};
