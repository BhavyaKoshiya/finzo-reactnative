import React from 'react';
import { View } from 'react-native';
import ResultCard from '../../../../components/cards/ResultCard';
import { formatINR } from '../../../../calculations/core/currency';

export const EMIResultCard = ({ result, style }) => {
  if (!result) return null;

  const { monthlyEMI, totalInterest, totalPayment, principal } = result;

  const items = [
    { label: 'Principal Loan Amount', value: formatINR(principal) },
    { label: 'Total Interest Payable', value: formatINR(totalInterest) },
    { label: 'Total Amount Payable', value: formatINR(totalPayment) },
  ];

  return (
    <View style={style}>
      <ResultCard
        title="Monthly EMI"
        primaryValue={formatINR(monthlyEMI)}
        items={items}
      />
    </View>
  );
};

export default EMIResultCard;
