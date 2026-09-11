import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, Percent, TrendingUp, TrendingDown, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import AppText from '../../../components/common/AppText';
import AppCard from '../../../components/cards/AppCard';
import AppIcon from '../../../components/common/AppIcon';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import TextInputField from '../../../components/forms/TextInputField';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { selectLoanProfileById, updateLoanProfile } from '../../../store/slices/loanProfilesSlice';
import {
  selectRateRevisionById,
  updateRateRevision,
  deleteRateRevision,
} from '../../../store/slices/loanRateRevisionsSlice';
import { useRateRevisionForm } from '../hooks/useRateRevisionForm';
import { RATE_ADJUSTMENT_STRATEGIES, RATE_ADJUSTMENT_STRATEGY_OPTIONS } from '../types/rateRevisionTypes';
import { formatCurrency } from '../../../utils/financeFormatters';

export const EditRateRevisionScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { currentTheme } = useAppTheme();

  const revisionId = route?.params?.revisionId;
  const loanId = route?.params?.loanId;

  const loan = useSelector((state) => selectLoanProfileById(state, loanId));
  const revision = useSelector((state) => selectRateRevisionById(state, revisionId));

  const form = useRateRevisionForm({
    loan,
    initialValues: revision || {},
  });

  if (!loan || !revision) {
    return (
      <ScreenContainer
        header={
          <AppHeader
            title="Edit Rate Revision"
            leftAction={{ icon: ArrowLeft, onPress: () => navigation.goBack() }}
          />
        }
      >
        <View style={styles.notFound}>
          <AppText variant="bodyMedium">Rate revision or loan profile not found.</AppText>
        </View>
      </ScreenContainer>
    );
  }

  const handleUpdate = () => {
    if (!form.validate()) return;

    const revisionRecord = form.buildRevisionRecord();
    dispatch(
      updateRateRevision({
        id: revision.id,
        updates: revisionRecord,
      })
    );

    // Update loan profile if applicable
    if (form.calculationResult.profileUpdates && Object.keys(form.calculationResult.profileUpdates).length > 0) {
      dispatch(
        updateLoanProfile({
          id: loan.id,
          ...form.calculationResult.profileUpdates,
        })
      );
    }

    Alert.alert('Revision Updated', 'Interest rate revision has been updated.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Rate Revision',
      'Are you sure you want to delete this interest rate revision record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteRateRevision(revision.id));
            navigation.goBack();
          },
        },
      ]
    );
  };

  const isHike = form.rateDelta > 0;
  const isCut = form.rateDelta < 0;

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Edit Rate Revision"
          leftAction={{ icon: ArrowLeft, onPress: () => navigation.goBack() }}
          rightAction={{ icon: Trash2, onPress: handleDelete, color: '#EF4444' }}
        />
      }
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Revision Details */}
        <AppCard style={styles.card}>
          <AppText variant="caption" color={currentTheme.textMuted} style={styles.sectionHeader}>
            REVISION DETAILS
          </AppText>

          <TextInputField
            label="New Interest Rate (% p.a.)"
            placeholder="e.g. 8.75"
            keyboardType="decimal-pad"
            value={form.newRate}
            onChangeText={form.setNewRate}
            error={form.errors.newRate}
          />

          {form.newRate !== '' && !isNaN(Number(form.newRate)) && Number(form.newRate) > 0 && (
            <View
              style={[
                styles.deltaBadge,
                {
                  backgroundColor: isHike
                    ? '#EF444415'
                    : isCut
                    ? '#10B98115'
                    : `${currentTheme.card}80`,
                },
              ]}
            >
              <AppIcon
                icon={isHike ? TrendingUp : isCut ? TrendingDown : Percent}
                size={16}
                color={isHike ? '#EF4444' : isCut ? '#10B981' : currentTheme.textSecondary}
              />
              <AppText
                variant="caption"
                style={{
                  color: isHike ? '#EF4444' : isCut ? '#10B981' : currentTheme.textSecondary,
                  fontWeight: '700',
                  marginLeft: 6,
                }}
              >
                {isHike
                  ? `Rate Hike of +${form.rateDelta.toFixed(2)}%`
                  : isCut
                  ? `Rate Cut of ${form.rateDelta.toFixed(2)}%`
                  : 'Rate unchanged'}
              </AppText>
            </View>
          )}

          <TextInputField
            label="Effective Date (YYYY-MM-DD)"
            placeholder="YYYY-MM-DD"
            value={form.effectiveDate}
            onChangeText={form.setEffectiveDate}
            error={form.errors.effectiveDate}
          />
        </AppCard>

        {/* Strategy */}
        <AppCard style={styles.card}>
          <AppText variant="caption" color={currentTheme.textMuted} style={styles.sectionHeader}>
            HOW TO APPLY THE REVISION
          </AppText>

          <View style={styles.strategyRow}>
            {RATE_ADJUSTMENT_STRATEGY_OPTIONS.map((option) => {
              const isSelected = form.adjustmentStrategy === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => form.setAdjustmentStrategy(option.value)}
                  style={[
                    styles.strategyTile,
                    {
                      borderColor: isSelected ? currentTheme.primary : `${currentTheme.border}`,
                      backgroundColor: isSelected ? `${currentTheme.primary}12` : `${currentTheme.card}`,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={styles.strategyHeader}>
                    <AppText
                      variant="bodyMedium"
                      style={{
                        fontWeight: '700',
                        color: isSelected ? currentTheme.primary : currentTheme.text,
                      }}
                    >
                      {option.label}
                    </AppText>
                    {isSelected && (
                      <AppIcon icon={CheckCircle2} size={16} color={currentTheme.primary} />
                    )}
                  </View>
                  <AppText variant="caption" color={currentTheme.textSecondary} style={{ marginTop: 4 }}>
                    {option.description}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>

          {form.calculationResult.isNegativeAmortization && (
            <View style={styles.warningBox}>
              <AppIcon icon={AlertTriangle} size={18} color="#EF4444" />
              <AppText variant="caption" color="#EF4444" style={{ flex: 1, marginLeft: 8 }}>
                {form.calculationResult.warning}
              </AppText>
            </View>
          )}
        </AppCard>

        {/* Calculated Impact */}
        {form.calculationResult.isValid && (
          <AppCard style={[styles.card, { backgroundColor: `${currentTheme.primary}08` }]}>
            <AppText variant="caption" color={currentTheme.primary} style={[styles.sectionHeader, { fontWeight: '700' }]}>
              CALCULATED REVISION IMPACT
            </AppText>

            {form.adjustmentStrategy === RATE_ADJUSTMENT_STRATEGIES.ADJUST_EMI ? (
              <View style={styles.impactContent}>
                <View style={styles.impactRow}>
                  <AppText variant="bodyMedium">New Monthly EMI:</AppText>
                  <AppText variant="h3" color={currentTheme.primary} style={{ fontWeight: '700' }}>
                    {formatCurrency(form.calculationResult.appliedNewEmi)}
                  </AppText>
                </View>
                <View style={styles.impactRow}>
                  <AppText variant="caption" color={currentTheme.textSecondary}>EMI Difference:</AppText>
                  <AppText
                    variant="caption"
                    style={{
                      fontWeight: '700',
                      color: form.calculationResult.deltaEmi > 0 ? '#EF4444' : '#10B981',
                    }}
                  >
                    {form.calculationResult.deltaEmi > 0 ? '+' : ''}
                    {formatCurrency(form.calculationResult.deltaEmi)}/mo
                  </AppText>
                </View>
              </View>
            ) : (
              <View style={styles.impactContent}>
                <View style={styles.impactRow}>
                  <AppText variant="bodyMedium">New Remaining Tenure:</AppText>
                  <AppText variant="h3" color={currentTheme.primary} style={{ fontWeight: '700' }}>
                    {form.calculationResult.appliedNewTenureMonths} months
                  </AppText>
                </View>
                <View style={styles.impactRow}>
                  <AppText variant="caption" color={currentTheme.textSecondary}>Tenure Difference:</AppText>
                  <AppText
                    variant="caption"
                    style={{
                      fontWeight: '700',
                      color: form.calculationResult.deltaTenureMonths > 0 ? '#EF4444' : '#10B981',
                    }}
                  >
                    {form.calculationResult.deltaTenureMonths > 0 ? '+' : ''}
                    {form.calculationResult.deltaTenureMonths} months
                  </AppText>
                </View>
              </View>
            )}
          </AppCard>
        )}

        {/* Bank Override */}
        <AppCard style={styles.card}>
          <TouchableOpacity
            style={styles.overrideToggleRow}
            onPress={() => form.setShowBankOverride(!form.showBankOverride)}
            activeOpacity={0.8}
          >
            <View style={{ flex: 1, marginRight: 8 }}>
              <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>
                Match Bank's Exact Letter / SMS
              </AppText>
              <AppText variant="caption" color={currentTheme.textSecondary}>
                Optional bank override
              </AppText>
            </View>
            <Switch
              value={form.showBankOverride}
              onValueChange={form.setShowBankOverride}
              trackColor={{ false: currentTheme.border, true: currentTheme.primary }}
            />
          </TouchableOpacity>

          {form.showBankOverride && (
            <View style={styles.overrideFields}>
              {form.adjustmentStrategy === RATE_ADJUSTMENT_STRATEGIES.ADJUST_EMI ? (
                <TextInputField
                  label="Exact Bank EMI (₹)"
                  placeholder={`e.g. ${form.calculationResult.calculatedNewEmi || ''}`}
                  keyboardType="numeric"
                  value={form.exactNewEmi}
                  onChangeText={form.setExactNewEmi}
                  error={form.errors.exactNewEmi}
                />
              ) : (
                <TextInputField
                  label="Exact Bank Remaining Tenure (Months)"
                  placeholder={`e.g. ${form.calculationResult.calculatedNewTenureMonths || ''}`}
                  keyboardType="numeric"
                  value={form.exactNewTenureMonths}
                  onChangeText={form.setExactNewTenureMonths}
                  error={form.errors.exactNewTenureMonths}
                />
              )}
            </View>
          )}
        </AppCard>

        {/* Notes */}
        <AppCard style={styles.card}>
          <TextInputField
            label="Notes / Remarks (Optional)"
            placeholder="e.g. RBI repo rate hike"
            value={form.note}
            onChangeText={form.setNote}
            multiline
            numberOfLines={2}
          />
        </AppCard>

        {/* Actions */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Update Rate Revision"
            onPress={handleUpdate}
            disabled={!form.calculationResult.isValid}
          />
          <SecondaryButton
            title="Delete Record"
            onPress={handleDelete}
            style={{ marginTop: 12, borderColor: '#EF4444' }}
            textColor="#EF4444"
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 12,
  },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: -8,
    marginBottom: 16,
  },
  strategyRow: {
    gap: 10,
  },
  strategyTile: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  strategyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#EF444415',
    borderRadius: 8,
    marginTop: 12,
  },
  impactContent: {
    gap: 8,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overrideToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overrideFields: {
    marginTop: 14,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
});

export default EditRateRevisionScreen;
