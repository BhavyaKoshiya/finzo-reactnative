import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  savedCalculations: [],
  schemaVersion: 1,
};

export const savedCalculationsSlice = createSlice({
  name: 'savedCalculations',
  initialState,
  reducers: {
    addSavedCalculation: (state, action) => {
      const newSnapshot = {
        ...action.payload,
        savedAt: action.payload.savedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: action.payload.isFavorite || false,
        schemaVersion: 1,
      };
      // Limit saved items to maximum 100 to protect storage
      if (state.savedCalculations.length >= 100) {
        state.savedCalculations.pop();
      }
      state.savedCalculations.unshift(newSnapshot);
    },
    updateSavedCalculation: (state, action) => {
      const { id, title, inputs, result } = action.payload;
      const index = state.savedCalculations.findIndex((item) => item.id === id);
      if (index !== -1) {
        state.savedCalculations[index] = {
          ...state.savedCalculations[index],
          title: title !== undefined ? title : state.savedCalculations[index].title,
          inputs: inputs !== undefined ? inputs : state.savedCalculations[index].inputs,
          result: result !== undefined ? result : state.savedCalculations[index].result,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteSavedCalculation: (state, action) => {
      const id = action.payload;
      state.savedCalculations = state.savedCalculations.filter((item) => item.id !== id);
    },
    toggleFavorite: (state, action) => {
      const id = action.payload;
      const item = state.savedCalculations.find((calc) => calc.id === id);
      if (item) {
        item.isFavorite = !item.isFavorite;
        item.updatedAt = new Date().toISOString();
      }
    },
    clearSavedCalculations: (state) => {
      state.savedCalculations = [];
    },
  },
});

export const {
  addSavedCalculation,
  updateSavedCalculation,
  deleteSavedCalculation,
  toggleFavorite,
  clearSavedCalculations,
} = savedCalculationsSlice.actions;

// Pure Redux Selectors
export const selectSavedCalculations = (state) =>
  state.savedCalculations?.savedCalculations || [];

export const selectFavoriteCalculations = (state) =>
  (state.savedCalculations?.savedCalculations || []).filter((item) => item.isFavorite);

export const selectSavedCalculationById = (state, id) =>
  (state.savedCalculations?.savedCalculations || []).find((item) => item.id === id);

export const selectSavedCount = (state) =>
  (state.savedCalculations?.savedCalculations || []).length;

export default savedCalculationsSlice.reducer;
