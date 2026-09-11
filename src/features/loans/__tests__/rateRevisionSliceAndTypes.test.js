import { createRateRevision, isValidRateRevision, RATE_ADJUSTMENT_STRATEGIES } from '../types/rateRevisionTypes';
import loanRateRevisionsReducer, {
  addRateRevision,
  updateRateRevision,
  deleteRateRevision,
  deleteRevisionsForLoan,
  selectAllRateRevisions,
  selectRateRevisionsByLoanId,
  selectLatestRateRevision,
  selectRateRevisionById,
} from '../../../store/slices/loanRateRevisionsSlice';

describe('Rate Revision Types & Slice', () => {
  describe('createRateRevision Factory', () => {
    test('creates normalized rate revision record with defaults', () => {
      const record = createRateRevision({
        loanId: 'loan_1',
        previousRate: 8.5,
        newRate: 8.75,
        effectiveDate: '2024-07-01',
        calculatedNewEmi: 44000,
        outstandingAtRevision: 4000000,
        previousEmi: 43000,
      });

      expect(record.id).toMatch(/^rev_/);
      expect(record.schemaVersion).toBe(1);
      expect(record.loanId).toBe('loan_1');
      expect(record.previousRate).toBe(8.5);
      expect(record.newRate).toBe(8.75);
      expect(record.effectiveDate).toBe('2024-07-01');
      expect(record.adjustmentStrategy).toBe(RATE_ADJUSTMENT_STRATEGIES.ADJUST_EMI);
      expect(record.appliedNewEmi).toBe(44000);
      expect(record.outstandingAtRevision).toBe(4000000);
    });

    test('respects exact bank override if provided', () => {
      const record = createRateRevision({
        loanId: 'loan_1',
        previousRate: 8.5,
        newRate: 8.75,
        calculatedNewEmi: 44120,
        exactNewEmi: 44100, // Bank override
      });

      expect(record.exactNewEmi).toBe(44100);
      expect(record.appliedNewEmi).toBe(44100);
    });

    test('isValidRateRevision validates records properly', () => {
      expect(isValidRateRevision(null)).toBe(false);
      expect(isValidRateRevision({})).toBe(false);
      expect(isValidRateRevision({ id: '1', loanId: 'l1', newRate: 0, effectiveDate: '2024-01-01' })).toBe(false);
      expect(isValidRateRevision({ id: '1', loanId: 'l1', newRate: 8.5, effectiveDate: '' })).toBe(false);
      expect(isValidRateRevision({ id: '1', loanId: 'l1', newRate: 8.5, effectiveDate: '2024-01-01' })).toBe(true);
    });
  });

  describe('loanRateRevisionsSlice', () => {
    const initialState = { revisions: [] };

    test('adds rate revisions without artificial cap', () => {
      let state = initialState;
      const rev1 = createRateRevision({ id: 'rev_1', loanId: 'loan_a', previousRate: 8.0, newRate: 8.5, effectiveDate: '2024-01-01' });
      const rev2 = createRateRevision({ id: 'rev_2', loanId: 'loan_a', previousRate: 8.5, newRate: 8.75, effectiveDate: '2024-06-01' });

      state = loanRateRevisionsReducer(state, addRateRevision(rev1));
      state = loanRateRevisionsReducer(state, addRateRevision(rev2));

      expect(state.revisions).toHaveLength(2);
      expect(state.revisions[0].id).toBe('rev_2'); // Unshifted
    });

    test('updates existing rate revision', () => {
      const rev = createRateRevision({ id: 'rev_1', loanId: 'loan_a', previousRate: 8.0, newRate: 8.5 });
      let state = { revisions: [rev] };

      state = loanRateRevisionsReducer(
        state,
        updateRateRevision({ id: 'rev_1', updates: { note: 'RBI repo rate hike' } })
      );

      expect(state.revisions[0].note).toBe('RBI repo rate hike');
    });

    test('deletes rate revision by id', () => {
      const rev1 = createRateRevision({ id: 'rev_1', loanId: 'loan_a', newRate: 8.5 });
      const rev2 = createRateRevision({ id: 'rev_2', loanId: 'loan_a', newRate: 8.75 });
      let state = { revisions: [rev1, rev2] };

      state = loanRateRevisionsReducer(state, deleteRateRevision('rev_1'));
      expect(state.revisions).toHaveLength(1);
      expect(state.revisions[0].id).toBe('rev_2');
    });

    test('cascades deletion for loan across all revisions', () => {
      const revA = createRateRevision({ id: 'rev_1', loanId: 'loan_a', newRate: 8.5 });
      const revB = createRateRevision({ id: 'rev_2', loanId: 'loan_b', newRate: 9.0 });
      let state = { revisions: [revA, revB] };

      state = loanRateRevisionsReducer(state, deleteRevisionsForLoan('loan_a'));
      expect(state.revisions).toHaveLength(1);
      expect(state.revisions[0].loanId).toBe('loan_b');
    });

    test('selectors sort revisions by effective date descending', () => {
      const revOld = createRateRevision({ id: 'rev_1', loanId: 'loan_a', effectiveDate: '2023-01-01', newRate: 8.0 });
      const revNew = createRateRevision({ id: 'rev_2', loanId: 'loan_a', effectiveDate: '2024-06-01', newRate: 8.5 });
      const rootState = {
        loanRateRevisions: { revisions: [revOld, revNew] },
      };

      const sorted = selectRateRevisionsByLoanId(rootState, 'loan_a');
      expect(sorted[0].id).toBe('rev_2');
      expect(sorted[1].id).toBe('rev_1');

      const latest = selectLatestRateRevision(rootState, 'loan_a');
      expect(latest.id).toBe('rev_2');

      const single = selectRateRevisionById(rootState, 'rev_1');
      expect(single.id).toBe('rev_1');
    });
  });
});
