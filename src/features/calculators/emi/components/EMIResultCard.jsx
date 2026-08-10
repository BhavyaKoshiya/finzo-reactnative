import React from 'react';
import { View } from 'react-native';
import ResultCard from '../../../../components/cards/ResultCard';
import { formatINR } from '../../../../calculations/core/currency';

export const EMIResultCard = ({ result, style }) => {
  if (!result) return null;

  const { monthlyEMI } = result;

  return (
    <View style={style}>
      <ResultCard
        title="Monthly EMI"
        value={formatINR(monthlyEMI)}
      />
    </View>
  );
};

export default EMIResultCard;
