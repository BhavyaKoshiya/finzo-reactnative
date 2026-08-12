import {
  getTotalOutstanding,
  getTotalMonthlyEMI,
  getActiveLoanCount,
  calculatePrincipalRepaymentProgress,
} from '../utils/loanDashboardUtils';

describe('Loan Dashboard Utilities', () => {
  const sampleLoans = [
    { id: '1', status: 'active', currentOutstandingPrincipal: 500000, emiAmount: 15000 },
    { id: '2', status: 'active', currentOutstandingPrincipal: 200000, emiAmount: 8000 },
    { id: '3', status: 'archived', currentOutstandingPrincipal: 100000, emiAmount: 3000 },
  ];

  test('13. Calculates zero repayment progress when outstanding equals original', () => {
    const progress = calculatePrincipalRepaymentProgress(1000000, 1000000);
    expect(progress.principalRepaid).toBe(0);
    expect(progress.ratio).toBe(0);
    expect(progress.percentage).toBe(0);
  });

  test('14. Calculates partial repayment progress correctly', () => {
    const progress = calculatePrincipalRepaymentProgress(1000000, 750000);
    expect(progress.principalRepaid).toBe(250000);
    expect(progress.ratio).toBe(0.25);
    expect(progress.percentage).toBe(25);
  });

  test('15. Calculates full repayment progress when outstanding is zero', () => {
    const progress = calculatePrincipalRepaymentProgress(1000000, 0);
    expect(progress.principalRepaid).toBe(1000000);
    expect(progress.ratio).toBe(1);
    expect(progress.percentage).toBe(100);
  });

  test('16. Clamps progress to 0 if outstanding exceeds original due to interest/fees', () => {
    const progress = calculatePrincipalRepaymentProgress(1000000, 1100000);
    expect(progress.ratio).toBe(0);
    expect(progress.percentage).toBe(0);
  });

  test('17. Clamps progress ratio to 1 maximum', () => {
    const progress = calculatePrincipalRepaymentProgress(1000000, -50000);
    expect(progress.ratio).toBe(1);
    expect(progress.percentage).toBe(100);
  });

  test('18. Calculates total outstanding sum of active loans only', () => {
    const total = getTotalOutstanding(sampleLoans);
    expect(total).toBe(700000);
  });

  test('19. Calculates total monthly EMI sum of active loans only', () => {
    const totalEmi = getTotalMonthlyEMI(sampleLoans);
    expect(totalEmi).toBe(23000);
  });

  test('20. Returns correct active loan count', () => {
    const count = getActiveLoanCount(sampleLoans);
    expect(count).toBe(2);
  });
});
