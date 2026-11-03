// newArchEnabled=false in android/gradle.properties stops react-native-fast-shadow
// from running codegen, so its generated JNI folder never exists. Exclude it from
// C++ autolinking; RN's legacy view-manager interop renders ShadowedView instead.
module.exports = {
  dependencies: {
    'react-native-fast-shadow': {
      platforms: {
        android: {
          libraryName: null,
          componentDescriptors: null,
          cmakeListsPath: null,
        },
      },
    },
  },
};
