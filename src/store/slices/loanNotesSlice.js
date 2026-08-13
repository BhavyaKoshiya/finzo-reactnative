import { createSlice, createSelector } from '@reduxjs/toolkit';
import { MAX_NOTES_PER_LOAN } from '../../features/loans/types/loanNoteTypes';

const initialState = {
  notes: [],
};

const loanNotesSlice = createSlice({
  name: 'loanNotes',
  initialState,
  reducers: {
    addLoanNote: (state, action) => {
      const newNote = action.payload;
      if (!newNote || !newNote.loanId) return;

      const notesForLoan = state.notes.filter((n) => n.loanId === newNote.loanId);
      if (notesForLoan.length >= MAX_NOTES_PER_LOAN) {
        return; // Max 500 notes per loan guard
      }

      state.notes.unshift(newNote);
    },

    updateLoanNote: (state, action) => {
      const { id, updates } = action.payload || {};
      if (!id || !updates) return;

      const index = state.notes.findIndex((n) => n.id === id);
      if (index !== -1) {
        state.notes[index] = {
          ...state.notes[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },

    deleteLoanNote: (state, action) => {
      const noteId = action.payload;
      state.notes = state.notes.filter((n) => n.id !== noteId);
    },

    toggleLoanNotePinned: (state, action) => {
      const noteId = action.payload;
      const note = state.notes.find((n) => n.id === noteId);
      if (note) {
        note.isPinned = !note.isPinned;
        note.updatedAt = new Date().toISOString();
      }
    },

    deleteNotesForLoan: (state, action) => {
      const loanId = action.payload;
      state.notes = state.notes.filter((n) => n.loanId !== loanId);
    },
  },
});

export const {
  addLoanNote,
  updateLoanNote,
  deleteLoanNote,
  toggleLoanNotePinned,
  deleteNotesForLoan,
} = loanNotesSlice.actions;

// Selectors
export const selectAllLoanNotes = (state) => state.loanNotes?.notes || [];

export const selectLoanNotesByLoanId = createSelector(
  [selectAllLoanNotes, (state, loanId) => loanId],
  (notes, loanId) => notes.filter((n) => n.loanId === loanId)
);

export const selectPinnedLoanNotesByLoanId = createSelector(
  [selectAllLoanNotes, (state, loanId) => loanId],
  (notes, loanId) => notes.filter((n) => n.loanId === loanId && n.isPinned)
);

export const selectLoanNoteById = createSelector(
  [selectAllLoanNotes, (state, noteId) => noteId],
  (notes, noteId) => notes.find((n) => n.id === noteId)
);

export default loanNotesSlice.reducer;
