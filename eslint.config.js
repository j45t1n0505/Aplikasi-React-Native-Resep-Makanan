// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'dist-*/*'],
  },
  {
    rules: {
      // SharedValue Reanimated memang diubah dari callback gesture/timer.
      // Aturan immutability React tidak memahami objek mutable milik Reanimated.
      'react-hooks/immutability': 'off',
    },
  },
]);
