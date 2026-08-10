module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@reduxjs/toolkit|react-redux|immer|redux-persist|@react-native-async-storage/async-storage|lucide-react-native|react-native-svg|react-native-reanimated|react-native-worklets-core)/)',
  ],
};
