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
  header = null,
  scrollable = false,
  backgroundColor,
  paddingHorizontal = 16,
  contentContainerStyle,
  style,
  keyboardVerticalOffset = 0,
  useSafeAreaTop = true,
  useSafeAreaBottom = true,
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

  const safeAreaInsetsStyle = {
    paddingTop: header ? 0 : useSafeAreaTop ? insets.top : 0,
    paddingBottom: useSafeAreaBottom ? insets.bottom : 0,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };

  const fixedHeaderStyle = {
    paddingTop: useSafeAreaTop ? insets.top : 0,
    paddingHorizontal,
    backgroundColor: containerBg,
  };

  return (
    <KeyboardAvoidingView
      style={[styles.keyboardView, { backgroundColor: containerBg }, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardVerticalOffset}
      {...otherProps}
    >
      {header && (
        <View style={[styles.fixedHeaderContainer, fixedHeaderStyle]}>
          {header}
        </View>
      )}

      <View style={[styles.safeAreaContainer, safeAreaInsetsStyle]}>
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
  fixedHeaderContainer: {
    zIndex: 10,
  },
  safeAreaContainer: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingVertical: 12,
  },
  staticContainer: {
    flex: 1,
  },
});

export default ScreenContainer;
