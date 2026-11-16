import React from 'react';
import { View } from 'react-native';
import ResultCard from '../../../../components/cards/ResultCard';
import { formatCurrency } from '../../../../utils/financeFormatters';

export const EMIResultCard = ({ result, style }) => {
  if (!result) return null;

  const { monthlyEMI } = result;

  return (
    <View style={style}>
      <ResultCard
        title="Monthly EMI"
        value={formatCurrency(monthlyEMI)}
      />
    </View>
  );
};

export default EMIResultCard;
