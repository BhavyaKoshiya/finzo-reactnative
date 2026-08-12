import React, { useState, useMemo } from 'react';
import { View, StyleSheet, SectionList, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { ArrowLeft, Plus, ReceiptText } from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import AppText from '../../../components/common/AppText';
import AppCard from '../../../components/cards/AppCard';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import EmptyState from '../../../components/feedback/EmptyState';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { selectLoanProfileById } from '../../../store/slices/loanProfilesSlice';
import { selectPaymentsForLoan } from '../../../store/slices/loanPaymentsSlice';
import { getPaymentStats, groupPaymentsByMonth } from '../utils/loanBalanceUtils';
import { PAYMENT_TYPES } from '../constants/loanPaymentConstants';
import LoanPaymentCard from '../components/LoanPaymentCard';
import { formatCurrency } from '../../../utils/financeFormatters';
import { ROUTES } from '../../../navigation/routes';

export const LoanPaymentHistoryScreen = ({ route, navigation }) => {
  const { currentTheme } = useAppTheme();
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'EMI' | 'PREPAYMENT' | 'OTHER'

  const loanId = route?.params?.loanId;
  const loan = useSelector((state) => selectLoanProfileById(state, loanId));
  const rawPayments = useSelector((state) => selectPaymentsForLoan(state, loanId));

  const stats = useMemo(() => getPaymentStats(rawPayments, loanId), [rawPayments, loanId]);

  const filteredPayments = useMemo(() => {
    if (filterType === 'EMI') {
      return rawPayments.filter((p) => p.paymentType === PAYMENT_TYPES.EMI);
    }
    if (filterType === 'PREPAYMENT') {
      return rawPayments.filter(
        (p) => p.paymentType === PAYMENT_TYPES.PART_PREPAYMENT || p.paymentType === PAYMENT_TYPES.FULL_PAYMENT
      );
    }
    if (filterType === 'OTHER') {
      return rawPayments.filter((p) => p.paymentType === PAYMENT_TYPES.OTHER);
    }
    return rawPayments;
  }, [rawPayments, filterType]);

  const groupedSections = useMemo(() => {
    const groups = groupPaymentsByMonth(filteredPayments);
    return groups.map((g) => ({
      title: g.monthLabel,
      data: g.data,
    }));
  }, [filteredPayments]);

  if (!loan) {
    return (
      <ScreenContainer
        header={
          <AppHeader
            title="Payment History"
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

  const renderHeader = () => (
    <AppHeader
      title="Payment History"
      subtitle={loan.name}
      leftAction={{
        icon: ArrowLeft,
        onPress: () => navigation.goBack(),
        accessibilityLabel: 'Go back',
      }}
      rightAction={{
        icon: Plus,
        onPress: () => navigation.navigate(ROUTES.ADD_PAYMENT, { loanId: loan.id }),
        accessibilityLabel: 'Record new payment',
      }}
    />
  );

  return (
    <ScreenContainer
      header={renderHeader()}
      useSafeAreaTop={false}
      useSafeAreaBottom={true}
      style={styles.container}
    >
      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {[
          { label: 'All', key: 'ALL' },
          { label: 'EMIs', key: 'EMI' },
          { label: 'Prepayments', key: 'PREPAYMENT' },
          { label: 'Other', key: 'OTHER' },
        ].map((f) => {
          const isSelected = filterType === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilterType(f.key)}
              activeOpacity={0.7}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isSelected ? currentTheme.primary : currentTheme.surface,
                  borderColor: isSelected ? currentTheme.primary : currentTheme.border,
                },
              ]}
            >
              <AppText
                variant="caption"
                color={isSelected ? '#FFFFFF' : currentTheme.textSecondary}
                style={{ fontWeight: isSelected ? '700' : '500' }}
              >
                {f.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main Timeline List */}
      <SectionList
        sections={groupedSections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          rawPayments.length > 0 ? (
            <AppCard style={styles.summaryCard}>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryCol}>
                  <AppText variant="caption" color={currentTheme.textSecondary}>
                    Total Paid
                  </AppText>
                  <AppText variant="titleMedium" color={currentTheme.primary} style={{ fontWeight: '800' }}>
                    {formatCurrency(stats.totalPaid)}
                  </AppText>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryCol}>
                  <AppText variant="caption" color={currentTheme.textSecondary}>
                    Payments Count
                  </AppText>
                  <AppText variant="titleMedium" style={{ fontWeight: '700' }}>
                    {stats.totalPayments} {stats.totalPayments === 1 ? 'Payment' : 'Payments'}
                  </AppText>
                </View>
              </View>
            </AppCard>
          ) : null
        }
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <AppText variant="caption" color={currentTheme.textSecondary} style={styles.sectionTitle}>
              {title}
            </AppText>
          </View>
        )}
        renderItem={({ item }) => (
          <LoanPaymentCard
            payment={item}
            onPress={() => navigation.navigate(ROUTES.EDIT_PAYMENT, { paymentId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              icon={ReceiptText}
              title="No Payments Recorded"
              description="Record your EMI payments and part-prepayments to build a clear statement history for this loan."
            />
            <PrimaryButton
              title="Record Payment"
              icon={Plus}
              onPress={() => navigation.navigate(ROUTES.ADD_PAYMENT, { loanId: loan.id })}
              style={styles.addBtn}
            />
          </View>
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notFound: {
    padding: 32,
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    padding: 16,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryCol: {
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  sectionHeader: {
    paddingVertical: 8,
    marginTop: 6,
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  emptyContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  addBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
  },
});

export default LoanPaymentHistoryScreen;
