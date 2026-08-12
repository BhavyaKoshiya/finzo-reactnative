import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { ArrowLeft, Plus, Archive, ShieldAlert } from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import AppText from '../../../components/common/AppText';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import EmptyState from '../../../components/feedback/EmptyState';
import { useAppTheme } from '../../../hooks/useAppTheme';
import {
  selectActiveLoanProfiles,
  selectArchivedLoanProfiles,
  selectTotalOutstanding,
  selectTotalMonthlyEMI,
  selectActiveLoanCount,
} from '../../../store/slices/loanProfilesSlice';
import LoanDashboardSummary from '../components/LoanDashboardSummary';
import LoanProfileCard from '../components/LoanProfileCard';
import { ROUTES } from '../../../navigation/routes';

export const LoanDashboardScreen = ({ navigation }) => {
  const { currentTheme } = useAppTheme();
  const [tab, setTab] = useState('active'); // 'active' | 'archived'

  const activeLoans = useSelector(selectActiveLoanProfiles);
  const archivedLoans = useSelector(selectArchivedLoanProfiles);
  const totalOutstanding = useSelector(selectTotalOutstanding);
  const totalMonthlyEMI = useSelector(selectTotalMonthlyEMI);
  const activeCount = useSelector(selectActiveLoanCount);

  const displayedLoans = tab === 'active' ? activeLoans : archivedLoans;

  const renderHeader = () => (
    <AppHeader
      title="My Loans"
      subtitle="Track your real-world loan accounts"
      leftAction={{
        icon: ArrowLeft,
        onPress: () => navigation.goBack(),
        accessibilityLabel: 'Go back',
      }}
      rightAction={{
        icon: Plus,
        onPress: () => navigation.navigate(ROUTES.ADD_LOAN),
        accessibilityLabel: 'Add new loan',
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
      {/* Top Segment Control */}
      <View style={styles.segmentContainer}>
        <View style={[styles.segmentBg, { backgroundColor: currentTheme.surfaceVariant }]}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              tab === 'active' && [styles.segmentActive, { backgroundColor: currentTheme.surface }],
            ]}
            onPress={() => setTab('active')}
            activeOpacity={0.7}
          >
            <AppText
              variant="bodySmall"
              color={tab === 'active' ? currentTheme.primary : currentTheme.textSecondary}
              style={tab === 'active' && styles.activeText}
            >
              Active Loans ({activeCount})
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              tab === 'archived' && [styles.segmentActive, { backgroundColor: currentTheme.surface }],
            ]}
            onPress={() => setTab('archived')}
            activeOpacity={0.7}
          >
            <AppText
              variant="bodySmall"
              color={tab === 'archived' ? currentTheme.primary : currentTheme.textSecondary}
              style={tab === 'archived' && styles.activeText}
            >
              Archived ({archivedLoans.length})
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main List */}
      <FlatList
        data={displayedLoans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          tab === 'active' && activeCount > 0 ? (
            <LoanDashboardSummary
              totalOutstanding={totalOutstanding}
              totalMonthlyEMI={totalMonthlyEMI}
              activeCount={activeCount}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <LoanProfileCard
            profile={item}
            onPress={() =>
              navigation.navigate(ROUTES.LOAN_DETAILS, { loanId: item.id })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              icon={tab === 'active' ? ShieldAlert : Archive}
              title={tab === 'active' ? 'Track Your Loans' : 'No Archived Loans'}
              description={
                tab === 'active'
                  ? 'Add your existing home, personal, or car loans to Finzo to view outstanding balance, monthly EMI, and upcoming payment dates.'
                  : 'Loans you archive will appear here safely stored.'
              }
            />
            {tab === 'active' && (
              <PrimaryButton
                title="Add Loan Profile"
                icon={Plus}
                onPress={() => navigation.navigate(ROUTES.ADD_LOAN)}
                style={styles.addBtn}
              />
            )}
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
  segmentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  segmentBg: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeText: {
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
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

export default LoanDashboardScreen;
