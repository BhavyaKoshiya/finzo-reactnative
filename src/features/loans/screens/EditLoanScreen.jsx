import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { ArrowLeft } from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import LoanProfileForm from '../components/LoanProfileForm';
import { useLoanProfileForm } from '../hooks/useLoanProfileForm';
import { selectLoanProfileById } from '../../../store/slices/loanProfilesSlice';

export const EditLoanScreen = ({ route, navigation }) => {
  const loanId = route?.params?.loanId;
  const existingProfile = useSelector((state) => selectLoanProfileById(state, loanId));

  const form = useLoanProfileForm(existingProfile, () => {
    Alert.alert('Changes Saved', 'Your loan profile has been updated!');
    navigation.goBack();
  });

  const renderHeader = () => (
    <AppHeader
      title="Edit Loan Profile"
      subtitle={existingProfile?.name || 'Update loan details'}
      leftAction={{
        icon: ArrowLeft,
        onPress: () => navigation.goBack(),
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
        onSave={form.handleSubmit}
        onCancel={() => navigation.goBack()}
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
