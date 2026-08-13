import loanPrivateDetailsReducer, {
  setLoanPrivateDetails,
  clearLoanPrivateDetails,
  deletePrivateDetailsForLoan,
} from '../../../store/slices/loanPrivateDetailsSlice';

describe('loanPrivateDetailsSlice Reducer & Actions', () => {
  const initialState = { detailsByLoanId: {} };

  const sampleDetails = {
    loanId: 'loan_1',
    lenderName: 'HDFC Bank',
    loanAccountReference: 'L123456789',
    customerReference: 'CUST99',
    branchName: 'MG Road',
  };

  it('sets private details for a loan', () => {
    const nextState = loanPrivateDetailsReducer(
      initialState,
      setLoanPrivateDetails(sampleDetails)
    );

    expect(nextState.detailsByLoanId['loan_1']).toBeDefined();
    expect(nextState.detailsByLoanId['loan_1'].lenderName).toBe('HDFC Bank');
  });

  it('clears private details for a loan', () => {
    let state = loanPrivateDetailsReducer(
      initialState,
      setLoanPrivateDetails(sampleDetails)
    );
    expect(state.detailsByLoanId['loan_1']).toBeDefined();

    state = loanPrivateDetailsReducer(state, clearLoanPrivateDetails('loan_1'));
    expect(state.detailsByLoanId['loan_1']).toBeUndefined();
  });

  it('deletes private details when loan is deleted', () => {
    let state = loanPrivateDetailsReducer(
      initialState,
      setLoanPrivateDetails(sampleDetails)
    );
    state = loanPrivateDetailsReducer(state, deletePrivateDetailsForLoan('loan_1'));
    expect(state.detailsByLoanId['loan_1']).toBeUndefined();
  });
});
