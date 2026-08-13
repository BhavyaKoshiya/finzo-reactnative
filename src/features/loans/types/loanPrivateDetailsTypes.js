/**
 * Factory for creating normalized Loan Private Details entity objects.
 */
export const createLoanPrivateDetails = ({
  loanId,
  lenderName = '',
  loanAccountReference = '',
  customerReference = '',
  branchName = '',
  branchAddress = '',
  branchContact = '',
  loanOfficerName = '',
  loanOfficerContact = '',
  insuranceProvider = '',
  insurancePolicyReference = '',
  collateralDescription = '',
  importantDates = '',
  customFields = [],
  hasSecureCredential = false,
}) => {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    loanId,
    lenderName: String(lenderName || '').trim(),
    loanAccountReference: String(loanAccountReference || '').trim(),
    customerReference: String(customerReference || '').trim(),
    branchName: String(branchName || '').trim(),
    branchAddress: String(branchAddress || '').trim(),
    branchContact: String(branchContact || '').trim(),
    loanOfficerName: String(loanOfficerName || '').trim(),
    loanOfficerContact: String(loanOfficerContact || '').trim(),
    insuranceProvider: String(insuranceProvider || '').trim(),
    insurancePolicyReference: String(insurancePolicyReference || '').trim(),
    collateralDescription: String(collateralDescription || '').trim(),
    importantDates: String(importantDates || '').trim(),
    customFields: Array.isArray(customFields) ? customFields : [],
    hasSecureCredential: Boolean(hasSecureCredential),
    createdAt: now,
    updatedAt: now,
  };
};
