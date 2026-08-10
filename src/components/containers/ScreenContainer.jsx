import React, { forwardRef } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';

export const ScreenContainer = forwardRef(({
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
  scrollViewRef,
  ...otherProps
}, ref) => {
  const insets = useSafeAreaInsets();
  const { currentTheme } = useAppTheme();

  const containerBg = backgroundColor || currentTheme.background;
  const targetScrollRef = ref || scrollViewRef;

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
            ref={targetScrollRef}
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
});

ScreenContainer.displayName = 'ScreenContainer';

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  fixedHeaderContainer: {
    zIndex: 100,
    elevation: 4,
    width: '100%',
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
