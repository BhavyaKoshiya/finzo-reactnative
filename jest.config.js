module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@reduxjs/toolkit|react-redux|immer|redux-persist|@react-native-async-storage/async-storage|lucide-react-native|react-native-svg|react-native-reanimated|react-native-worklets|react-native-worklets-core|react-native-gesture-handler|@gorhom/bottom-sheet|@react-native-community/slider|@d11/react-native-fast-image|react-native-fast-shadow|react-native-gifted-charts)/)',
  ],
};
