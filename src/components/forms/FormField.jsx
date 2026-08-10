import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '../common/AppText';
import AppIcon from '../common/AppIcon';
import { useAppTheme } from '../../hooks/useAppTheme';

export const FormField = ({
  label,
  helperText,
  errorText,
  required = false,
  leadingIcon,
  trailingContent,
  children,
  style,
}) => {
  const { currentTheme } = useAppTheme();

  const hasError = !!errorText;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelRow}>
          <AppText variant="resultLabel" color={currentTheme.textPrimary}>
            {label}
            {required && <AppText variant="resultLabel" color={currentTheme.error}> *</AppText>}
          </AppText>
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: currentTheme.surface,
            borderColor: hasError ? currentTheme.error : currentTheme.border,
          },
        ]}
      >
        {leadingIcon && (
          <View style={styles.leadingIcon}>
            <AppIcon
              icon={leadingIcon}
              size={20}
              color={hasError ? currentTheme.error : currentTheme.textSecondary}
            />
          </View>
        )}

        <View style={styles.inputSlot}>{children}</View>

        {trailingContent && <View style={styles.trailingContent}>{trailingContent}</View>}
      </View>

      {hasError ? (
        <AppText variant="caption" color={currentTheme.error} style={styles.helperText}>
          {errorText}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" color={currentTheme.textMuted} style={styles.helperText}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 12,
  },
  leadingIcon: {
    marginRight: 8,
  },
  inputSlot: {
    flex: 1,
    justifyContent: 'center',
  },
  trailingContent: {
    marginLeft: 8,
  },
  helperText: {
    marginTop: 4,
    marginLeft: 2,
  },
});

export default FormField;
