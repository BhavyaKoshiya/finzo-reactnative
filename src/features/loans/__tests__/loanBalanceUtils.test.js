import {
  getTotalPaidForLoan,
  getTotalPaidByType,
  getPaymentStats,
  getBalanceHistory,
  getLatestKnownBalance,
  getBalanceChange,
  groupPaymentsByMonth,
  calculateEmiBreakdown,
} from '../utils/loanBalanceUtils';
import { PAYMENT_TYPES } from '../constants/loanPaymentConstants';

describe('Loan Balance Utilities', () => {
  const samplePayments = [
    {
      id: 'p1',
      loanId: 'l1',
      amount: 21450,
      paymentDate: '2026-08-15',
      paymentType: PAYMENT_TYPES.EMI,
      outstandingBefore: 742500,
      outstandingAfter: 726320,
      createdAt: '2026-08-15T10:00:00Z',
    },
    {
      id: 'p2',
      loanId: 'l1',
      amount: 100000,
      paymentDate: '2026-07-20',
      paymentType: PAYMENT_TYPES.PART_PREPAYMENT,
      outstandingBefore: 842500,
      outstandingAfter: 742500,
      createdAt: '2026-07-20T10:00:00Z',
    },
    {
      id: 'p3',
      loanId: 'l1',
      amount: 21450,
      paymentDate: '2026-06-15',
      paymentType: PAYMENT_TYPES.EMI,
      outstandingBefore: 863950,
      outstandingAfter: 842500,
      createdAt: '2026-06-15T10:00:00Z',
    },
    {
      id: 'p4',
      loanId: 'l2',
      amount: 8000,
      paymentDate: '2026-08-10',
      paymentType: PAYMENT_TYPES.EMI,
      outstandingBefore: 200000,
      outstandingAfter: 192000,
      createdAt: '2026-08-10T10:00:00Z',
    },
  ];

  test('13. Calculates total paid for loan correctly', () => {
    const total = getTotalPaidForLoan(samplePayments, 'l1');
    expect(total).toBe(142900);
  });

  test('14. Calculates total EMI paid correctly', () => {
    const totalEmi = getTotalPaidByType(samplePayments, 'l1', PAYMENT_TYPES.EMI);
    expect(totalEmi).toBe(42900);
  });

  test('15. Calculates total prepayments paid correctly', () => {
    const totalPrepaid = getTotalPaidByType(samplePayments, 'l1', PAYMENT_TYPES.PART_PREPAYMENT);
    expect(totalPrepaid).toBe(100000);
  });

  test('16. Computes correct total payment count for loan', () => {
    const stats = getPaymentStats(samplePayments, 'l1');
    expect(stats.totalPayments).toBe(3);
    expect(stats.emiCount).toBe(2);
    expect(stats.prepaymentCount).toBe(1);
  });

  test('17. Returns correct latest payment record', () => {
    const stats = getPaymentStats(samplePayments, 'l1');
    expect(stats.latestPayment.id).toBe('p1');
    expect(stats.lastPaymentDate).toBe('2026-08-15');
  });

  test('18. Filters payments by type', () => {
    const emis = samplePayments.filter((p) => p.loanId === 'l1' && p.paymentType === PAYMENT_TYPES.EMI);
    expect(emis.length).toBe(2);
  });

  test('19. Sorts payments newest-first', () => {
    const stats = getPaymentStats(samplePayments, 'l1');
    expect(stats.latestPayment.paymentDate).toBe('2026-08-15');
  });

  test('20. Groups payments by month correctly', () => {
    const l1Payments = samplePayments.filter((p) => p.loanId === 'l1');
    const grouped = groupPaymentsByMonth(l1Payments);
    expect(grouped.length).toBe(3);
    expect(grouped[0].monthLabel).toContain('August');
    expect(grouped[1].monthLabel).toContain('July');
    expect(grouped[2].monthLabel).toContain('June');
  });

  test('21. Returns chronological balance snapshot history', () => {
    const history = getBalanceHistory(samplePayments, 'l1');
    expect(history.length).toBe(3);
    expect(history[0].date).toBe('2026-06-15');
    expect(history[0].balance).toBe(842500);
    expect(history[2].date).toBe('2026-08-15');
    expect(history[2].balance).toBe(726320);
  });

  test('22. Returns latest known balance correctly', () => {
    const latestBalance = getLatestKnownBalance(samplePayments, 'l1');
    expect(latestBalance).toBe(726320);
  });

  test('23. Calculates balance change correctly', () => {
    const change = getBalanceChange(742500, 726320);
    expect(change.diff).toBe(-16180);
    expect(change.percentageChange).toBeCloseTo(-2.179, 2);
  });

  test('24. Calculates EMI interest & principal breakdown correctly for regular EMI', () => {
    // Current Outstanding = ₹1,50,000, Interest Rate = 10% p.a. (Monthly Interest = ₹1,250)
    // EMI Payment = ₹1,500
    const res = calculateEmiBreakdown({
      currentOutstanding: 150000,
      annualInterestRate: 10,
      amount: 1500,
      paymentType: PAYMENT_TYPES.EMI,
    });

    expect(res.interestPaid).toBe(1250);
    expect(res.principalPaid).toBe(250);
    expect(res.newOutstanding).toBe(149750);
  });

  test('25. Calculates Part Prepayment breakdown correctly (100% principal reduction)', () => {
    const res = calculateEmiBreakdown({
      currentOutstanding: 150000,
      annualInterestRate: 10,
      amount: 15000,
      paymentType: PAYMENT_TYPES.PART_PREPAYMENT,
    });

    expect(res.interestPaid).toBe(0);
    expect(res.principalPaid).toBe(15000);
    expect(res.newOutstanding).toBe(135000);
  });
});
