import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { FileText, Edit3, Archive, Trash2, ChevronRight } from 'lucide-react-native';
import AppCard from '../../../components/cards/AppCard';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import { useAppTheme } from '../../../hooks/useAppTheme';

export const ManageLoanCard = ({
  isArchived = false,
  onExportReport,
  onEditProfile,
  onArchiveToggle,
  onDeletePress,
  style,
}) => {
  const { currentTheme } = useAppTheme();

  return (
    <AppCard style={[styles.card, style]}>
      <AppText variant="cardTitle" style={styles.sectionTitle}>
        Manage Loan
      </AppText>

      <TouchableOpacity
        onPress={onExportReport}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Export loan report as PDF"
        style={[styles.rowItem, { borderBottomColor: currentTheme.border }]}
      >
        <View style={styles.leftRow}>
          <AppIcon icon={FileText} size={18} color={currentTheme.primary} style={{ marginRight: 10 }} />
          <AppText variant="bodyMedium" style={{ fontWeight: '600' }}>
            Export Report (PDF)
          </AppText>
        </View>
        <AppIcon icon={ChevronRight} size={16} color={currentTheme.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onEditProfile}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Edit loan profile details"
        style={[styles.rowItem, { borderBottomColor: currentTheme.border }]}
      >
        <View style={styles.leftRow}>
          <AppIcon icon={Edit3} size={18} color={currentTheme.textSecondary} style={{ marginRight: 10 }} />
          <AppText variant="bodyMedium" style={{ fontWeight: '600' }}>
            Edit Loan Profile
          </AppText>
        </View>
        <AppIcon icon={ChevronRight} size={16} color={currentTheme.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onArchiveToggle}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={isArchived ? 'Unarchive loan profile' : 'Archive loan profile'}
        style={[styles.rowItem, { borderBottomColor: currentTheme.border }]}
      >
        <View style={styles.leftRow}>
          <AppIcon icon={Archive} size={18} color={currentTheme.textSecondary} style={{ marginRight: 10 }} />
          <AppText variant="bodyMedium" style={{ fontWeight: '600' }}>
            {isArchived ? 'Unarchive Loan Profile' : 'Archive Loan Profile'}
          </AppText>
        </View>
        <AppIcon icon={ChevronRight} size={16} color={currentTheme.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onDeletePress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Delete loan profile"
        style={[styles.rowItem, styles.destructiveRow]}
      >
        <View style={styles.leftRow}>
          <AppIcon icon={Trash2} size={18} color={currentTheme.error} style={{ marginRight: 10 }} />
          <AppText variant="bodyMedium" color={currentTheme.error} style={{ fontWeight: '700' }}>
            Delete Loan Profile
          </AppText>
        </View>
        <AppIcon icon={ChevronRight} size={16} color={currentTheme.error} />
      </TouchableOpacity>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  destructiveRow: {
    borderBottomWidth: 0,
    paddingBottom: 4,
  },
});

export default ManageLoanCard;
