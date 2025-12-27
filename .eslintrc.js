// .eslintrc.js
module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error', // Treat formatting issues as errors
    'react/react-in-jsx-scope': 'off', // Not needed in React Native
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Allow _vars
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  ignorePatterns: ['/dist/*', '/node_modules/*'],
};
