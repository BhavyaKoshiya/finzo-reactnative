import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { ArrowLeft, Plus, Percent, TrendingUp, TrendingDown, ChevronRight, Calendar, Landmark } from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import AppText from '../../../components/common/AppText';
import AppCard from '../../../components/cards/AppCard';
import AppIcon from '../../../components/common/AppIcon';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { selectLoanProfileById } from '../../../store/slices/loanProfilesSlice';
import { selectRateRevisionsByLoanId } from '../../../store/slices/loanRateRevisionsSlice';
import { ROUTES } from '../../../navigation/routes';
import { formatDateForDisplay } from '../../../utils/dateUtils';
import { formatCurrency } from '../../../utils/financeFormatters';

export const LoanRateRevisionsScreen = ({ route, navigation }) => {
  const { currentTheme } = useAppTheme();

  const loanId = route?.params?.loanId;
  const loan = useSelector((state) => selectLoanProfileById(state, loanId));
  const revisions = useSelector((state) => selectRateRevisionsByLoanId(state, loanId));

  if (!loan) {
    return (
      <ScreenContainer
        header={
          <AppHeader
            title="Rate Revisions"
            leftAction={{ icon: ArrowLeft, onPress: () => navigation.goBack() }}
          />
        }
      >
        <View style={styles.notFound}>
          <AppText variant="bodyMedium">Loan profile not found.</AppText>
        </View>
      </ScreenContainer>
    );
  }

  const handleAddRevision = () => {
    navigation.navigate(ROUTES.ADD_RATE_REVISION, { loanId: loan.id });
  };

  const handleEditRevision = (revision) => {
    navigation.navigate(ROUTES.EDIT_RATE_REVISION, {
      loanId: loan.id,
      revisionId: revision.id,
    });
  };

  const renderItem = ({ item, index }) => {
    const prevRate = Number(item.previousRate) || 0;
    const newRate = Number(item.newRate) || 0;
    const diff = newRate - prevRate;
    const isHike = diff > 0;
    const isCut = diff < 0;
    const isBankMatch = Boolean(item.exactNewEmi || item.exactNewTenureMonths);

    return (
      <AppCard style={styles.card}>
        <TouchableOpacity
          onPress={() => handleEditRevision(item)}
          activeOpacity={0.7}
          style={styles.cardContent}
          accessibilityRole="button"
          accessibilityLabel={`Rate revision from ${prevRate}% to ${newRate}% on ${formatDateForDisplay(item.effectiveDate)}`}
        >
          <View style={styles.headerRow}>
            <View style={styles.dateRow}>
              <AppIcon icon={Calendar} size={14} color={currentTheme.textSecondary} />
              <AppText variant="caption" color={currentTheme.textSecondary} style={{ marginLeft: 4, fontWeight: '600' }}>
                Effective {formatDateForDisplay(item.effectiveDate)}
              </AppText>
            </View>
            <View
              style={[
                styles.deltaBadge,
                {
                  backgroundColor: isHike
                    ? '#EF444415'
                    : isCut
                    ? '#10B98115'
                    : `${currentTheme.card}80`,
                },
              ]}
            >
              <AppIcon
                icon={isHike ? TrendingUp : isCut ? TrendingDown : Percent}
                size={12}
                color={isHike ? '#EF4444' : isCut ? '#10B981' : currentTheme.textSecondary}
              />
              <AppText
                variant="caption"
                style={{
                  color: isHike ? '#EF4444' : isCut ? '#10B981' : currentTheme.textSecondary,
                  fontWeight: '700',
                  fontSize: 11,
                  marginLeft: 3,
                }}
              >
                {isHike ? `+${diff.toFixed(2)}%` : isCut ? `${diff.toFixed(2)}%` : '0.00%'}
              </AppText>
            </View>
          </View>

          {/* Rate Transition */}
          <View style={styles.transitionRow}>
            <View>
              <AppText variant="caption" color={currentTheme.textSecondary}>Previous Rate</AppText>
              <AppText variant="bodyLarge" color={currentTheme.textMuted} style={styles.rateStrikethrough}>
                {prevRate}%
              </AppText>
            </View>
            <AppText variant="bodyMedium" color={currentTheme.textMuted} style={{ marginHorizontal: 12 }}>
              →
            </AppText>
            <View>
              <AppText variant="caption" color={currentTheme.textSecondary}>New Rate</AppText>
              <AppText variant="h3" color={currentTheme.primary} style={{ fontWeight: '700' }}>
                {newRate}%
              </AppText>
            </View>
            <View style={{ flex: 1 }} />
            <AppIcon icon={ChevronRight} size={18} color={currentTheme.textMuted} />
          </View>

          {/* Impact details */}
          <View style={styles.impactFooter}>
            <View style={styles.footerItem}>
              <AppText variant="caption" color={currentTheme.textSecondary}>
                Strategy: <AppText variant="caption" style={{ fontWeight: '600' }}>
                  {item.adjustmentStrategy === 'adjust_tenure' ? 'Adjust Tenure' : 'Adjust EMI'}
                </AppText>
              </AppText>
            </View>
            {item.appliedNewEmi > 0 && (
              <View style={styles.footerItem}>
                <AppText variant="caption" color={currentTheme.textSecondary}>
                  Revised EMI: <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '700' }}>
                    {formatCurrency(item.appliedNewEmi)}
                  </AppText>
                </AppText>
              </View>
            )}
            {isBankMatch && (
              <View style={[styles.bankMatchBadge, { backgroundColor: `${currentTheme.primary}12` }]}>
                <AppIcon icon={Landmark} size={11} color={currentTheme.primary} />
                <AppText variant="caption" color={currentTheme.primary} style={{ fontSize: 10, fontWeight: '700', marginLeft: 3 }}>
                  Bank Match
                </AppText>
              </View>
            )}
          </View>

          {item.note ? (
            <AppText variant="caption" color={currentTheme.textMuted} style={styles.noteText} numberOfLines={2}>
              "{item.note}"
            </AppText>
          ) : null}
        </TouchableOpacity>
      </AppCard>
    );
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Rate Revisions"
          leftAction={{ icon: ArrowLeft, onPress: () => navigation.goBack() }}
          rightAction={{ icon: Plus, onPress: handleAddRevision }}
        />
      }
    >
      <FlatList
        data={revisions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <AppCard style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View>
                <AppText variant="caption" color={currentTheme.textSecondary}>Current Active Rate</AppText>
                <AppText variant="h2" color={currentTheme.primary} style={{ fontWeight: '700' }}>
                  {loan.annualInterestRate}%
                </AppText>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <AppText variant="caption" color={currentTheme.textSecondary}>Revisions Logged</AppText>
                <AppText variant="h3" style={{ fontWeight: '700' }}>
                  {revisions.length}
                </AppText>
              </View>
            </View>
            <AppText variant="caption" color={currentTheme.textMuted} style={{ marginTop: 8 }}>
              Track floating interest rate changes linked to RBI repo rate / EBLR benchmarks.
            </AppText>
          </AppCard>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconBox, { backgroundColor: `${currentTheme.primary}15` }]}>
              <AppIcon icon={Percent} size={32} color={currentTheme.primary} />
            </View>
            <AppText variant="bodyLarge" style={{ fontWeight: '700', marginTop: 16 }}>
              No Rate Revisions Yet
            </AppText>
            <AppText variant="caption" color={currentTheme.textSecondary} style={styles.emptySubtitle}>
              When your bank adjusts your floating interest rate, log it here to see how your EMI or tenure changes.
            </AppText>
            <View style={{ marginTop: 20, width: '100%' }}>
              <PrimaryButton title="Log First Rate Revision" onPress={handleAddRevision} />
            </View>
          </View>
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  summaryCard: {
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    padding: 14,
    marginBottom: 12,
  },
  cardContent: {},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  transitionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rateStrikethrough: {
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  impactFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
  },
  footerItem: {
    marginRight: 6,
  },
  bankMatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  noteText: {
    fontStyle: 'italic',
    marginTop: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});

export default LoanRateRevisionsScreen;
