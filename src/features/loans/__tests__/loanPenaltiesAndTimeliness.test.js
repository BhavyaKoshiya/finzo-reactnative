import { createLoanPayment } from '../types/loanPaymentTypes';
import { adaptLoanPaymentForDisplay } from '../utils/loanPaymentPresentationAdapters';
import { PAYMENT_TIMELINESS, PENALTY_REASONS } from '../constants/loanPaymentConstants';

describe('Loan Penalties & Timeliness', () => {
  describe('Constants', () => {
    test('defines PAYMENT_TIMELINESS correctly', () => {
      expect(PAYMENT_TIMELINESS.ON_TIME).toBe('on_time');
      expect(PAYMENT_TIMELINESS.LATE).toBe('late');
      expect(PAYMENT_TIMELINESS.UNKNOWN).toBe('unknown');
    });

    test('defines PENALTY_REASONS correctly', () => {
      expect(PENALTY_REASONS.LATE_PAYMENT).toBe('late_payment');
      expect(PENALTY_REASONS.EMI_BOUNCE).toBe('emi_bounce');
      expect(PENALTY_REASONS.PREPAYMENT_PENALTY).toBe('prepayment_penalty');
      expect(PENALTY_REASONS.OTHER).toBe('other');
    });
  });

  describe('createLoanPayment Factory', () => {
    test('stores penaltyAmount and late payment details', () => {
      const payment = createLoanPayment({
        loanId: 'loan_1',
        amount: 25000,
        paymentDate: '2024-06-12',
        dueDate: '2024-06-05',
        isLatePayment: true,
        daysLate: 7,
        penaltyAmount: 500,
        penaltyReason: PENALTY_REASONS.LATE_PAYMENT,
      });

      expect(payment.penaltyAmount).toBe(500);
      expect(payment.feesAmount).toBe(500); // Backwards-compatible synchronization
      expect(payment.penaltyReason).toBe('late_payment');
      expect(payment.isLatePayment).toBe(true);
      expect(payment.daysLate).toBe(7);
    });

    test('retains backwards compatibility if feesAmount is passed instead of penaltyAmount', () => {
      const payment = createLoanPayment({
        loanId: 'loan_1',
        amount: 25000,
        feesAmount: 350,
      });

      expect(payment.penaltyAmount).toBe(350);
      expect(payment.feesAmount).toBe(350);
      expect(payment.isLatePayment).toBe(false);
      expect(payment.daysLate).toBe(0);
    });
  });

  describe('adaptLoanPaymentForDisplay', () => {
    test('formats penalty amount and includes late badge label', () => {
      const rawPayment = createLoanPayment({
        loanId: 'loan_1',
        amount: 25000,
        paymentDate: '2024-06-15',
        dueDate: '2024-06-05',
        isLatePayment: true,
        daysLate: 10,
        penaltyAmount: 750,
      });

      const adapted = adaptLoanPaymentForDisplay(rawPayment);

      expect(adapted.isLatePayment).toBe(true);
      expect(adapted.daysLate).toBe(10);
      expect(adapted.lateLabel).toBe('Late by 10d');
      expect(adapted.formattedPenalty).toBe('₹750');
      expect(adapted.accessibilityLabel).toContain('Includes penalty of ₹750');
    });

    test('handles on-time payment without penalty', () => {
      const rawPayment = createLoanPayment({
        loanId: 'loan_1',
        amount: 25000,
        paymentDate: '2024-06-05',
        dueDate: '2024-06-05',
        isLatePayment: false,
        daysLate: 0,
      });

      const adapted = adaptLoanPaymentForDisplay(rawPayment);

      expect(adapted.isLatePayment).toBe(false);
      expect(adapted.lateLabel).toBeNull();
      expect(adapted.formattedPenalty).toBeNull();
    });
  });
});
