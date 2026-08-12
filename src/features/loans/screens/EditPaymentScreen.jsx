import { View, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import AppText from '../../../components/common/AppText';
import { selectLoanProfileById, updateLoanProfile } from '../../../store/slices/loanProfilesSlice';
import { selectLoanPaymentById, updatePayment, deleteLoanPaymentWithRecalculation } from '../../../store/slices/loanPaymentsSlice';
import { useLoanPaymentForm } from '../hooks/useLoanPaymentForm';
import LoanPaymentForm from '../components/LoanPaymentForm';

export const EditPaymentScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();

  const paymentId = route?.params?.paymentId;
  const existingPayment = useSelector((state) => selectLoanPaymentById(state, paymentId));
  const loan = useSelector((state) => selectLoanProfileById(state, existingPayment?.loanId));

  const form = useLoanPaymentForm({
    initialValues: existingPayment || {},
    currentLoanOutstanding: loan?.currentOutstandingPrincipal || 0,
    annualInterestRate: loan?.annualInterestRate || 0,
    setEmiAmount: loan?.emiAmount || 0,
  });

  if (!existingPayment || !loan) {
    return (
      <ScreenContainer
        header={
          <AppHeader
            title="Edit Payment"
            leftAction={{ icon: ArrowLeft, onPress: () => navigation.goBack() }}
          />
        }
      >
        <View style={styles.notFound}>
          <AppText variant="bodyMedium">Payment record not found.</AppText>
        </View>
      </ScreenContainer>
    );
  }

  const handleUpdatePayment = () => {
    if (!form.validate()) return;

    const payload = form.getPaymentPayload();
    dispatch(updatePayment(payload));

    if (payload.balanceUpdated && payload.outstandingAfter !== null) {
      dispatch(
        updateLoanProfile({
          id: loan.id,
          currentOutstandingPrincipal: payload.outstandingAfter,
        })
      );
    }

    Alert.alert('Payment Updated', 'Payment record updated successfully.');
    navigation.goBack();
  };

  const handleDeletePayment = () => {
    Alert.alert(
      'Delete Payment?',
      'This will remove the payment from your loan history and recalculate the estimated outstanding balance.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Payment',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteLoanPaymentWithRecalculation({ paymentId: existingPayment.id, loan }));
            Alert.alert('Payment Deleted', 'Payment deleted and balance recalculated.');
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer
      scrollable
      header={
        <AppHeader
          title="Edit Payment"
          subtitle={loan.name}
          leftAction={{ icon: ArrowLeft, onPress: () => navigation.goBack(), accessibilityLabel: 'Go back' }}
          rightAction={{ icon: Trash2, onPress: handleDeletePayment, accessibilityLabel: 'Delete payment' }}
        />
      }
      useSafeAreaTop={false}
      useSafeAreaBottom={true}
      contentContainerStyle={styles.contentContainer}
    >
      <LoanPaymentForm
        form={form}
        onSave={handleUpdatePayment}
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

export default EditPaymentScreen;
