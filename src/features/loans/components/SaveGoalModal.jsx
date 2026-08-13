import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { X, Target, Sparkles, CheckCircle2 } from 'lucide-react-native';
import AppText from '../../../components/common/AppText';
import AppCard from '../../../components/cards/AppCard';
import AppIcon from '../../../components/common/AppIcon';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import TextInputField from '../../../components/forms/TextInputField';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { createLoanGoal, MAX_ACTIVE_GOALS_PER_LOAN } from '../types/loanGoalTypes';
import { createGoalBaselineSnapshot } from '../utils/loanGoalUtils';
import { addLoanGoal, selectActiveLoanGoalsByLoanId } from '../../../store/slices/loanGoalsSlice';

export const SaveGoalModal = ({
  visible,
  onClose,
  loan,
  payments,
  activeTab,
  simulation,
  scenarioConfig,
  onGoalSaved,
}) => {
  const dispatch = useDispatch();
  const { currentTheme } = useAppTheme();

  const activeGoals = useSelector((state) =>
    selectActiveLoanGoalsByLoanId(state, loan?.id)
  );

  const defaultTitle =
    simulation && simulation.tenureReduction
      ? `Finish loan ${simulation.tenureReduction.formattedTenureReduction}`
      : 'My Loan Payoff Goal';

  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState('');

  if (!visible || !loan || !simulation) return null;

  const isLimitReached = activeGoals.length >= MAX_ACTIVE_GOALS_PER_LOAN;

  const handleSave = () => {
    if (isLimitReached) {
      Alert.alert(
        'Goal Limit Reached',
        `You already have ${MAX_ACTIVE_GOALS_PER_LOAN} active goals for this loan. Please complete or delete an existing goal before saving a new one.`
      );
      return;
    }

    const baselineSnapshot = createGoalBaselineSnapshot(loan, payments);
    const newGoal = createLoanGoal({
      loanId: loan.id,
      type: scenarioConfig.type,
      title: title || defaultTitle,
      description,
      scenario: scenarioConfig,
      baselineSnapshot,
    });

    dispatch(addLoanGoal(newGoal));
    Alert.alert('Goal Saved!', 'Your payoff scenario has been saved as a personal goal.');
    onClose();
    if (onGoalSaved) onGoalSaved(newGoal);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerTitleRow}>
              <AppIcon icon={Target} size={20} color={currentTheme.primary} style={{ marginRight: 8 }} />
              <AppText variant="cardTitle">Save Payoff Goal</AppText>
            </View>
            <TouchableOpacity onPress={onClose}>
              <AppIcon icon={X} size={20} color={currentTheme.textMuted} />
            </TouchableOpacity>
          </View>

          <AppText variant="bodySmall" color={currentTheme.textSecondary} style={{ marginBottom: 14 }}>
            Turn this what-if scenario into a persistent local goal to track your actual payment progress over time.
          </AppText>

          {isLimitReached && (
            <View style={[styles.warningBox, { backgroundColor: currentTheme.warning + '20', borderColor: currentTheme.warning }]}>
              <AppText variant="caption" color={currentTheme.warning} style={{ fontWeight: '700' }}>
                Active Goal Limit Reached ({activeGoals.length}/{MAX_ACTIVE_GOALS_PER_LOAN})
              </AppText>
            </View>
          )}

          <TextInputField
            label="Goal Title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Finish loan 18 months earlier"
          />

          <TextInputField
            label="Personal Notes (Optional)"
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. Put annual work bonus toward principal"
            multiline
          />

          <View style={styles.actionRow}>
            <SecondaryButton title="Cancel" onPress={onClose} style={styles.btn} />
            <PrimaryButton
              title="Save Goal"
              icon={CheckCircle2}
              onPress={handleSave}
              disabled={isLimitReached}
              style={styles.btn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  btn: {
    flex: 1,
  },
});

export default SaveGoalModal;
