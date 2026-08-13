import React, { useState, useCallback } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft } from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import LoanProfileForm from '../components/LoanProfileForm';
import ReviewChangesModal from '../components/ReviewChangesModal';
import ManualBalanceUpdateModal from './ManualBalanceUpdateModal';
import { useLoanProfileForm } from '../hooks/useLoanProfileForm';
import {
  selectLoanProfileById,
  selectAllLoanProfiles,
} from '../../../store/slices/loanProfilesSlice';
import { selectPaymentsForLoan } from '../../../store/slices/loanPaymentsSlice';
import { selectLoanRemindersEnabled } from '../../../store/slices/settingsSlice';
import {
  getLoanProfileChanges,
  requiresMaterialChangeConfirmation,
  buildLoanChangeSummary,
} from '../utils/loanProfileChangeUtils';
import { updateLoanProfileService } from '../services/loanProfileUpdateService';

export const EditLoanScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const loanId = route?.params?.loanId;

  const existingProfile = useSelector((state) => selectLoanProfileById(state, loanId));
  const payments = useSelector((state) => selectPaymentsForLoan(state, loanId));
  const allLoans = useSelector(selectAllLoanProfiles);
  const globalRemindersEnabled = useSelector(selectLoanRemindersEnabled);

  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [balanceModalVisible, setBalanceModalVisible] = useState(false);
  const [changeSummary, setChangeSummary] = useState([]);
  const [pendingFormPayload, setPendingFormPayload] = useState(null);

  const form = useLoanProfileForm(existingProfile);

  const handleBackPress = useCallback(() => {
    if (form.isDirty) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [form.isDirty, navigation]);

  const executeSaveUpdate = useCallback((payloadToSave) => {
    try {
      const result = updateLoanProfileService({
        existingProfile,
        formPayload: payloadToSave,
        payments,
        globalRemindersEnabled,
        allLoans,
        dispatch,
      });

      if (!result.success) {
        Alert.alert('Unable to Save', 'Please check the input fields and try again.');
        return;
      }

      setReviewModalVisible(false);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Update Failed', err.message || 'Couldn\'t save changes. Please try again.');
    }
  }, [existingProfile, payments, globalRemindersEnabled, allLoans, dispatch, navigation]);

  const handleSaveAttempt = useCallback(() => {
    const rawPayload = form.getRawFormPayload();

    const changes = getLoanProfileChanges(existingProfile, rawPayload);
    if (changes.length === 0) {
      navigation.goBack();
      return;
    }

    if (requiresMaterialChangeConfirmation(changes, payments)) {
      setPendingFormPayload(rawPayload);
      setChangeSummary(buildLoanChangeSummary(changes));
      setReviewModalVisible(true);
    } else {
      executeSaveUpdate(rawPayload);
    }
  }, [form, existingProfile, payments, executeSaveUpdate, navigation]);

  const handleConfirmReviewModal = useCallback(() => {
    if (pendingFormPayload) {
      executeSaveUpdate(pendingFormPayload);
    }
  }, [pendingFormPayload, executeSaveUpdate]);

  const renderHeader = () => (
    <AppHeader
      title="Edit Loan Profile"
      subtitle={existingProfile?.name || 'Update loan details'}
      leftAction={{
        icon: ArrowLeft,
        onPress: handleBackPress,
        accessibilityLabel: 'Go back',
      }}
    />
  );

  return (
    <ScreenContainer
      scrollable
      header={renderHeader()}
      useSafeAreaTop={false}
      useSafeAreaBottom={true}
      contentContainerStyle={styles.contentContainer}
    >
      <LoanProfileForm
        form={form}
        hasPayments={payments.length > 0}
        onSave={handleSaveAttempt}
        onCancel={handleBackPress}
        onOpenBalanceCorrection={() => setBalanceModalVisible(true)}
      />

      <ReviewChangesModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        onConfirm={handleConfirmReviewModal}
        changeSummary={changeSummary}
      />

      <ManualBalanceUpdateModal
        visible={balanceModalVisible}
        onClose={() => setBalanceModalVisible(false)}
        loan={existingProfile}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 12,
    paddingBottom: 40,
  },
});

export default EditLoanScreen;
