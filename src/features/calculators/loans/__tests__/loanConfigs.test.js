import { LOAN_CONFIGS } from '../config/loanConfigs';

describe('Loan Configurations Integrity', () => {
  const loanTypes = ['HOME_LOAN', 'PERSONAL_LOAN', 'CAR_LOAN', 'EDUCATION_LOAN', 'BUSINESS_LOAN'];

  test('all 5 loan types must be defined', () => {
    loanTypes.forEach((type) => {
      expect(LOAN_CONFIGS[type]).toBeDefined();
    });
  });

  test('each loan config must have valid title, subtitle, defaults, and route', () => {
    loanTypes.forEach((type) => {
      const config = LOAN_CONFIGS[type];
      expect(config.id).toBeTruthy();
      expect(config.title).toBeTruthy();
      expect(config.subtitle).toBeTruthy();
      expect(config.description).toBeTruthy();
      expect(config.route).toBeTruthy();
      expect(config.defaults).toBeDefined();
      expect(config.defaults.loanAmount).toBeTruthy();
      expect(config.defaults.interestRate).toBeTruthy();
      expect(config.defaults.tenureValue).toBeTruthy();
      expect(config.defaults.tenureUnit).toBeTruthy();
    });
  });

  test('default loan amounts and interest rates should be valid positive numbers', () => {
    loanTypes.forEach((type) => {
      const config = LOAN_CONFIGS[type];
      const amount = parseFloat(config.defaults.loanAmount);
      const rate = parseFloat(config.defaults.interestRate);
      const tenure = parseFloat(config.defaults.tenureValue);

      expect(amount).toBeGreaterThan(0);
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(tenure).toBeGreaterThan(0);
    });
  });
});
