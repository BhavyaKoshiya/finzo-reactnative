import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import LoanProfileForm from '../components/LoanProfileForm';
import { useLoanProfileForm } from '../hooks/useLoanProfileForm';
import { navigateToMyLoans } from '../../../navigation/navigationHelpers';

export const AddLoanScreen = ({ navigation }) => {
  const form = useLoanProfileForm(null, () => {
    Alert.alert('Loan Created', 'Your loan profile has been saved successfully!');
    navigateToMyLoans(navigation, { initialSegment: 'loans' });
  });

  const renderHeader = () => (
    <AppHeader
      title="Add Loan Profile"
      subtitle="Enter details of your existing loan"
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

export default AddLoanScreen;
