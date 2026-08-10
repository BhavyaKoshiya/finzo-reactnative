import savedCalculationsReducer, {
  addSavedCalculation,
  updateSavedCalculation,
  deleteSavedCalculation,
  toggleFavorite,
  clearSavedCalculations,
  selectSavedCalculations,
  selectFavoriteCalculations,
  selectSavedCalculationById,
  selectSavedCount,
} from '../slices/savedCalculationsSlice';

describe('savedCalculationsSlice Redux Toolkit', () => {
  const initialState = {
    savedCalculations: [],
    schemaVersion: 1,
  };

  test('should handle initial state', () => {
    expect(savedCalculationsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  test('should add saved calculation to start of array', () => {
    const payload = {
      id: 'calc-1',
      calculatorId: 'home-loan-emi',
      title: 'My Home Loan',
      inputs: { loanAmount: '1000000' },
      result: { monthlyEMI: 20517 },
    };

    const state = savedCalculationsReducer(initialState, addSavedCalculation(payload));
    expect(state.savedCalculations).toHaveLength(1);
    expect(state.savedCalculations[0].id).toBe('calc-1');
    expect(state.savedCalculations[0].title).toBe('My Home Loan');
  });

  test('should update existing saved calculation', () => {
    const startState = {
      savedCalculations: [
        {
          id: 'calc-1',
          calculatorId: 'home-loan-emi',
          title: 'My Home Loan',
          inputs: { loanAmount: '1000000' },
          result: { monthlyEMI: 20517 },
        },
      ],
      schemaVersion: 1,
    };

    const updatePayload = {
      id: 'calc-1',
      title: 'Updated Home Loan Title',
      inputs: { loanAmount: '1500000' },
      result: { monthlyEMI: 30775 },
    };

    const state = savedCalculationsReducer(startState, updateSavedCalculation(updatePayload));
    expect(state.savedCalculations[0].title).toBe('Updated Home Loan Title');
    expect(state.savedCalculations[0].inputs.loanAmount).toBe('1500000');
  });

  test('should toggle favorite status', () => {
    const startState = {
      savedCalculations: [
        { id: 'calc-1', title: 'Test', isFavorite: false },
      ],
      schemaVersion: 1,
    };

    const state1 = savedCalculationsReducer(startState, toggleFavorite('calc-1'));
    expect(state1.savedCalculations[0].isFavorite).toBe(true);

    const state2 = savedCalculationsReducer(state1, toggleFavorite('calc-1'));
    expect(state2.savedCalculations[0].isFavorite).toBe(false);
  });

  test('should delete saved calculation by ID', () => {
    const startState = {
      savedCalculations: [
        { id: 'calc-1', title: 'Item 1' },
        { id: 'calc-2', title: 'Item 2' },
      ],
      schemaVersion: 1,
    };

    const state = savedCalculationsReducer(startState, deleteSavedCalculation('calc-1'));
    expect(state.savedCalculations).toHaveLength(1);
    expect(state.savedCalculations[0].id).toBe('calc-2');
  });

  test('should clear all saved calculations', () => {
    const startState = {
      savedCalculations: [{ id: 'calc-1' }, { id: 'calc-2' }],
      schemaVersion: 1,
    };

    const state = savedCalculationsReducer(startState, clearSavedCalculations());
    expect(state.savedCalculations).toHaveLength(0);
  });

  test('selectors should return filtered data correctly', () => {
    const rootState = {
      savedCalculations: {
        savedCalculations: [
          { id: 'calc-1', title: 'Loan 1', isFavorite: true },
          { id: 'calc-2', title: 'SIP 1', isFavorite: false },
        ],
      },
    };

    expect(selectSavedCalculations(rootState)).toHaveLength(2);
    expect(selectFavoriteCalculations(rootState)).toHaveLength(1);
    expect(selectFavoriteCalculations(rootState)[0].id).toBe('calc-1');
    expect(selectSavedCalculationById(rootState, 'calc-2').title).toBe('SIP 1');
    expect(selectSavedCount(rootState)).toBe(2);
  });
});
