import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { BookOpen, ChevronRight, Plus, Pin } from 'lucide-react-native';
import AppCard from '../../../components/cards/AppCard';
import AppText from '../../../components/common/AppText';
import AppIcon from '../../../components/common/AppIcon';
import { useAppTheme } from '../../../hooks/useAppTheme';

export const LoanNotesPreviewCard = ({
  notes = [],
  onViewNotes,
  style,
}) => {
  const { currentTheme } = useAppTheme();

  const noteCount = notes.length;
  const pinnedCount = notes.filter((n) => n.isPinned).length;

  return (
    <AppCard style={[styles.card, style]}>
      <TouchableOpacity
        onPress={onViewNotes}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={noteCount > 0 ? `View ${noteCount} loan notes` : 'Add note to loan'}
        style={styles.contentRow}
      >
        <View
          style={[
            styles.iconBox,
            { backgroundColor: noteCount > 0 ? `${currentTheme.primary}18` : `${currentTheme.textMuted}15` },
          ]}
        >
          <AppIcon icon={BookOpen} size={20} color={noteCount > 0 ? currentTheme.primary : currentTheme.textMuted} />
        </View>

        <View style={styles.textContainer}>
          <AppText variant="bodyMedium" style={{ fontWeight: '700', marginBottom: 2 }}>
            Notes ({noteCount})
          </AppText>
          {noteCount > 0 ? (
            <AppText variant="caption" color={currentTheme.textSecondary}>
              {pinnedCount > 0 ? `📌 ${pinnedCount} Pinned • ` : ''}Keep bank & payment references
            </AppText>
          ) : (
            <AppText variant="caption" color={currentTheme.textMuted}>
              Add private notes, bank details & payment remarks
            </AppText>
          )}
        </View>

        <View style={styles.actionRight}>
          <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '700', marginRight: 4 }}>
            {noteCount > 0 ? 'View Notes' : 'Add Note'}
          </AppText>
          <AppIcon icon={ChevronRight} size={16} color={currentTheme.primary} />
        </View>
      </TouchableOpacity>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginBottom: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  actionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default LoanNotesPreviewCard;
