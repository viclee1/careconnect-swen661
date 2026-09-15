// Flat config, as ESLint 9 expects. `eslint-config-expo` bundles the React,
// React Hooks and React Native rules that matter for an Expo project.
const expo = require('eslint-config-expo/flat');

module.exports = [
  ...expo,
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      '.expo/**',
      'android/**',
      'ios/**',
      'careconnect-app/**',
    ],
  },
];
