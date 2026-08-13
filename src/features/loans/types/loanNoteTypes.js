export const NOTE_CATEGORIES = {
  GENERAL: 'General',
  BANK: 'Bank',
  PAYMENT: 'Payment',
  INTEREST: 'Interest',
  PREPAYMENT: 'Prepayment',
  DOCUMENTS: 'Documents',
  IMPORTANT: 'Important',
};

export const MAX_NOTES_PER_LOAN = 500;

/**
 * Factory for creating normalized Loan Note entity objects.
 */
export const createLoanNote = ({
  loanId,
  title = 'Untitled Note',
  body = '',
  category = NOTE_CATEGORIES.GENERAL,
  isPinned = false,
}) => {
  const now = new Date().toISOString();
  return {
    id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    schemaVersion: 1,
    loanId,
    title: String(title || '').trim() || 'Untitled Note',
    body: String(body || '').trim(),
    category: Object.values(NOTE_CATEGORIES).includes(category) ? category : NOTE_CATEGORIES.GENERAL,
    isPinned: Boolean(isPinned),
    createdAt: now,
    updatedAt: now,
  };
};
