import { View, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft } from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import AppText from '../../../components/common/AppText';
import { selectLoanProfileById, updateLoanProfile } from '../../../store/slices/loanProfilesSlice';
import { addPayment } from '../../../store/slices/loanPaymentsSlice';
import { useLoanPaymentForm } from '../hooks/useLoanPaymentForm';
import LoanPaymentForm from '../components/LoanPaymentForm';
import { PAYMENT_TYPES } from '../constants/loanPaymentConstants';

export const AddPaymentScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();

  const loanId = route?.params?.loanId;
  const loan = useSelector((state) => selectLoanProfileById(state, loanId));

  const form = useLoanPaymentForm({
    initialValues: { loanId },
    currentLoanOutstanding: loan?.currentOutstandingPrincipal || 0,
    annualInterestRate: loan?.annualInterestRate || 0,
    setEmiAmount: loan?.emiAmount || 0,
  });

  if (!loan) {
    return (
      <ScreenContainer
        header={
          <AppHeader
            title="Record Payment"
            leftAction={{ icon: ArrowLeft, onPress: () => navigation.goBack() }}
          />
        }
      >
        <View style={styles.notFound}>
          <AppText variant="bodyMedium">Target loan profile not found.</AppText>
        </View>
      </ScreenContainer>
    );
  }

  const handleSavePayment = () => {
    if (!form.validate()) return;

    const payload = form.getPaymentPayload();
    dispatch(addPayment(payload));

    if (payload.balanceUpdated && payload.outstandingAfter !== null) {
      dispatch(
        updateLoanProfile({
          id: loan.id,
          currentOutstandingPrincipal: payload.outstandingAfter,
        })
      );
    }

    // Check full settlement completion prompt
    if (payload.paymentType === PAYMENT_TYPES.FULL_PAYMENT && (payload.outstandingAfter === 0 || (!payload.balanceUpdated && loan.currentOutstandingPrincipal === 0))) {
      Alert.alert(
        'Mark Loan Paid Off?',
        `You recorded a full payment for ${loan.name}. Would you like to mark this loan as completed?`,
        [
          {
            text: 'Keep Active',
            onPress: () => {
              Alert.alert('Payment Recorded', 'Payment has been added to loan history.');
              navigation.goBack();
            },
          },
          {
            text: 'Mark Completed',
            style: 'default',
            onPress: () => {
              dispatch(
                updateLoanProfile({
                  id: loan.id,
                  currentOutstandingPrincipal: 0,
                  status: 'archived',
                })
              );
              Alert.alert('Loan Completed', `${loan.name} has been marked paid off.`);
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      Alert.alert('Payment Recorded', 'Payment has been added to loan history.');
      navigation.goBack();
    }
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          title="Record Payment"
          subtitle={loan.name}
          leftAction={{ icon: ArrowLeft, onPress: () => navigation.goBack(), accessibilityLabel: 'Go back' }}
        />
      }
      useSafeAreaTop={false}
      useSafeAreaBottom={true}
      contentContainerStyle={styles.contentContainer}
    >
      <LoanPaymentForm
        form={form}
        onSave={handleSavePayment}
        onCancel={() => navigation.goBack()}
        currentLoanOutstanding={loan.currentOutstandingPrincipal}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 12,
    paddingBottom: 40,
  },
  notFound: {
    padding: 32,
    alignItems: 'center',
  },
});

export default AddPaymentScreen;
