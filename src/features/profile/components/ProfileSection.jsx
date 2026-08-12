import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '../../../components/common/AppText';

export const ProfileSection = ({ title, children, isLast = false, style }) => {
  return (
    <View style={[styles.section, isLast && styles.lastSection, style]}>
      {title && (
        <AppText variant="sectionTitle" style={styles.sectionTitle}>
          {title}
        </AppText>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  lastSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 12,
  },
});

export default ProfileSection;
