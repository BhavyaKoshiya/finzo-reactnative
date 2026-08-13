import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { ArrowLeft, Target, Plus, Compass } from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import AppText from '../../../components/common/AppText';
import AppCard from '../../../components/cards/AppCard';
import AppIcon from '../../../components/common/AppIcon';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { selectLoanProfileById } from '../../../store/slices/loanProfilesSlice';
import { selectPaymentsForLoan } from '../../../store/slices/loanPaymentsSlice';
import { selectLoanGoalsByLoanId } from '../../../store/slices/loanGoalsSlice';
import { GOAL_STATUS } from '../types/loanGoalTypes';
import LoanGoalCard from '../components/LoanGoalCard';
import { ROUTES } from '../../../navigation/routes';

export const LoanGoalsScreen = ({ route, navigation }) => {
  const { currentTheme } = useAppTheme();

  const loanId = route?.params?.loanId;
  const loan = useSelector((state) => selectLoanProfileById(state, loanId));
  const payments = useSelector((state) => selectPaymentsForLoan(state, loanId));
  const goals = useSelector((state) => selectLoanGoalsByLoanId(state, loanId));

  if (!loan) {
    return (
      <ScreenContainer
        header={
          <AppHeader
            title="Loan Goals"
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

  const activeGoals = goals.filter((g) => g.status !== GOAL_STATUS.COMPLETED);
  const completedGoals = goals.filter((g) => g.status === GOAL_STATUS.COMPLETED);

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          title="Loan Payoff Goals"
          subtitle={loan.name}
          leftAction={{ icon: ArrowLeft, onPress: () => navigation.goBack() }}
        />
      }
    >
      <View style={styles.topActionBanner}>
        <SecondaryButton
          title="Explore Payoff Planner"
          icon={Compass}
          onPress={() => navigation.navigate(ROUTES.LOAN_PAYOFF_PLANNER, { loanId: loan.id })}
        />
      </View>

      {/* Active Goals Section */}
      <View style={styles.sectionHeader}>
        <AppText variant="sectionTitle">Active Goals ({activeGoals.length}/5)</AppText>
      </View>

      {activeGoals.length > 0 ? (
        activeGoals.map((goal) => (
          <LoanGoalCard
            key={goal.id}
            goal={goal}
            loan={loan}
            payments={payments}
            onPress={() => navigation.navigate(ROUTES.LOAN_GOAL_DETAILS, { goalId: goal.id, loanId: loan.id })}
          />
        ))
      ) : (
        <AppCard style={styles.emptyCard}>
          <AppIcon icon={Target} size={32} color={currentTheme.textMuted} style={{ marginBottom: 8 }} />
          <AppText variant="bodyMedium" style={{ fontWeight: '700', marginBottom: 4 }}>
            No Active Goals Set
          </AppText>
          <AppText variant="bodySmall" color={currentTheme.textMuted} style={{ textAlign: 'center', marginBottom: 14 }}>
            Explore what-if scenarios in the Payoff Planner to set personal repayment goals.
          </AppText>
          <PrimaryButton
            title="Plan Payoff Scenarios"
            icon={Compass}
            onPress={() => navigation.navigate(ROUTES.LOAN_PAYOFF_PLANNER, { loanId: loan.id })}
          />
        </AppCard>
      )}

      {/* Completed Goals History */}
      {completedGoals.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <View style={styles.sectionHeader}>
            <AppText variant="sectionTitle">Completed Goals ({completedGoals.length})</AppText>
          </View>
          {completedGoals.map((goal) => (
            <LoanGoalCard
              key={goal.id}
              goal={goal}
              loan={loan}
              payments={payments}
              onPress={() => navigation.navigate(ROUTES.LOAN_GOAL_DETAILS, { goalId: goal.id, loanId: loan.id })}
            />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  notFound: {
    alignItems: 'center',
    padding: 32,
  },
  topActionBanner: {
    marginBottom: 16,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
});

export default LoanGoalsScreen;
