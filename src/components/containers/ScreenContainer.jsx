import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';

export const ScreenContainer = ({
  children,
  scrollable = false,
  backgroundColor,
  paddingHorizontal = 16,
  contentContainerStyle,
  style,
  keyboardVerticalOffset = 0,
  ...otherProps
}) => {
  const insets = useSafeAreaInsets();
  const { currentTheme } = useAppTheme();

  const containerBg = backgroundColor || currentTheme.background;

  const contentStyle = [
    styles.content,
    { paddingHorizontal },
    contentContainerStyle,
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.keyboardView, { backgroundColor: containerBg }, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardVerticalOffset}
      {...otherProps}
    >
      <View
        style={[
          styles.safeAreaContainer,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        {scrollable ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={contentStyle}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.staticContainer, contentStyle]}>
            {children}
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  safeAreaContainer: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingVertical: 16,
  },
  staticContainer: {
    flex: 1,
  },
});

export default ScreenContainer;
