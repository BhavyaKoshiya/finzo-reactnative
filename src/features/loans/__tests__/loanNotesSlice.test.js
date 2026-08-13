import loanNotesReducer, {
  addLoanNote,
  updateLoanNote,
  deleteLoanNote,
  toggleLoanNotePinned,
  deleteNotesForLoan,
} from '../../../store/slices/loanNotesSlice';
import { MAX_NOTES_PER_LOAN, NOTE_CATEGORIES } from '../types/loanNoteTypes';

describe('loanNotesSlice Reducer & Actions', () => {
  const initialState = { notes: [] };

  const sampleNote1 = {
    id: 'n1',
    loanId: 'loan_1',
    title: 'Sanction Letter',
    body: 'Sanctioned at 8.5%',
    category: NOTE_CATEGORIES.DOCUMENTS,
    isPinned: false,
  };

  const sampleNote2 = {
    id: 'n2',
    loanId: 'loan_1',
    title: 'Branch Contact',
    body: 'Officer Mr. Sharma',
    category: NOTE_CATEGORIES.BANK,
    isPinned: true,
  };

  const loanBNote = {
    id: 'nb1',
    loanId: 'loan_2',
    title: 'Loan B Note',
    body: 'Details for loan B',
    category: NOTE_CATEGORIES.GENERAL,
    isPinned: false,
  };

  it('adds a new loan note', () => {
    const nextState = loanNotesReducer(initialState, addLoanNote(sampleNote1));
    expect(nextState.notes.length).toBe(1);
    expect(nextState.notes[0].title).toBe('Sanction Letter');
  });

  it('enforces maximum 500 notes per loan limit guard', () => {
    let state = initialState;
    for (let i = 1; i <= MAX_NOTES_PER_LOAN; i++) {
      state = loanNotesReducer(
        state,
        addLoanNote({
          id: `n_${i}`,
          loanId: 'loan_1',
          title: `Note ${i}`,
        })
      );
    }
    expect(state.notes.length).toBe(500);

    // 501st note must be rejected
    const state501 = loanNotesReducer(
      state,
      addLoanNote({
        id: 'n_501',
        loanId: 'loan_1',
        title: 'Note 501',
      })
    );
    expect(state501.notes.length).toBe(500);
  });

  it('toggles note pinned state', () => {
    let state = loanNotesReducer(initialState, addLoanNote(sampleNote1));
    expect(state.notes[0].isPinned).toBe(false);

    state = loanNotesReducer(state, toggleLoanNotePinned('n1'));
    expect(state.notes[0].isPinned).toBe(true);
  });

  it('updates a loan note', () => {
    let state = loanNotesReducer(initialState, addLoanNote(sampleNote1));
    state = loanNotesReducer(
      state,
      updateLoanNote({
        id: 'n1',
        updates: { title: 'Updated Title' },
      })
    );
    expect(state.notes[0].title).toBe('Updated Title');
  });

  it('cascade deletes notes for a specific loan when loan is deleted', () => {
    let state = loanNotesReducer(initialState, addLoanNote(sampleNote1));
    state = loanNotesReducer(state, addLoanNote(sampleNote2));
    state = loanNotesReducer(state, addLoanNote(loanBNote));

    expect(state.notes.length).toBe(3);

    state = loanNotesReducer(state, deleteNotesForLoan('loan_1'));
    expect(state.notes.length).toBe(1);
    expect(state.notes[0].loanId).toBe('loan_2');
  });
});
