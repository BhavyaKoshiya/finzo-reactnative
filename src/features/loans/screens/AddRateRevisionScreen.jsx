import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, Percent, TrendingUp, TrendingDown, Calendar, Building2, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import AppText from '../../../components/common/AppText';
import AppCard from '../../../components/cards/AppCard';
import AppIcon from '../../../components/common/AppIcon';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import TextInputField from '../../../components/forms/TextInputField';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { selectLoanProfileById, updateLoanProfile } from '../../../store/slices/loanProfilesSlice';
import { addRateRevision } from '../../../store/slices/loanRateRevisionsSlice';
import { useRateRevisionForm } from '../hooks/useRateRevisionForm';
import { RATE_ADJUSTMENT_STRATEGIES, RATE_ADJUSTMENT_STRATEGY_OPTIONS } from '../types/rateRevisionTypes';
import { formatCurrency } from '../../../utils/financeFormatters';

export const AddRateRevisionScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { currentTheme } = useAppTheme();

  const loanId = route?.params?.loanId;
  const loan = useSelector((state) => selectLoanProfileById(state, loanId));

  const form = useRateRevisionForm({ loan });

  if (!loan) {
    return (
      <ScreenContainer
        header={
          <AppHeader
            title="Log Rate Revision"
            leftAction={{ icon: ArrowLeft, onPress: () => navigation.goBack() }}
          />
        }
      >
        <View style={styles.notFound}>
          <AppText variant="bodyMedium">Loan profile not found.</AppText>
        </View>
      </ScreenContainer>
    );
  }

  const handleSave = () => {
    if (!form.validate()) {
      return;
    }

    const revisionRecord = form.buildRevisionRecord();
    dispatch(addRateRevision(revisionRecord));

    // Update the loan profile with new interest rate and revised EMI/tenure
    if (form.calculationResult.profileUpdates && Object.keys(form.calculationResult.profileUpdates).length > 0) {
      dispatch(
        updateLoanProfile({
          id: loan.id,
          ...form.calculationResult.profileUpdates,
        })
      );
    }

    Alert.alert(
      'Rate Revision Logged',
      `Interest rate updated to ${form.newRate}%. Loan profile adjusted successfully.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const isHike = form.rateDelta > 0;
  const isCut = form.rateDelta < 0;

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Log Rate Revision"
          leftAction={{ icon: ArrowLeft, onPress: () => navigation.goBack() }}
        />
      }
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section 1: Current Loan Snapshot */}
        <AppCard style={styles.card}>
          <AppText variant="caption" color={currentTheme.textMuted} style={styles.sectionHeader}>
            CURRENT LOAN SNAPSHOT
          </AppText>
          <View style={styles.snapshotGrid}>
            <View style={styles.snapshotItem}>
              <AppText variant="caption" color={currentTheme.textSecondary}>Current Rate</AppText>
              <AppText variant="h3" color={currentTheme.primary} style={styles.boldText}>
                {form.currentRate}%
              </AppText>
            </View>
            <View style={styles.snapshotItem}>
              <AppText variant="caption" color={currentTheme.textSecondary}>Current EMI</AppText>
              <AppText variant="bodyLarge" style={styles.boldText}>
                {formatCurrency(form.currentEmi)}
              </AppText>
            </View>
            <View style={styles.snapshotItem}>
              <AppText variant="caption" color={currentTheme.textSecondary}>Remaining Tenure</AppText>
              <AppText variant="bodyLarge" style={styles.boldText}>
                {form.currentRemainingTenureMonths} mo
              </AppText>
            </View>
            <View style={styles.snapshotItem}>
              <AppText variant="caption" color={currentTheme.textSecondary}>Outstanding Balance</AppText>
              <AppText variant="bodyLarge" style={styles.boldText}>
                {formatCurrency(form.currentOutstanding)}
              </AppText>
            </View>
          </View>
        </AppCard>

        {/* Section 2: Revision Details */}
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
            helperText="Enter the revised floating interest rate from your bank"
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
            helperText="Date from which the bank implemented the revised rate"
          />
        </AppCard>

        {/* Section 3: Adjustment Strategy */}
        <AppCard style={styles.card}>
          <AppText variant="caption" color={currentTheme.textMuted} style={styles.sectionHeader}>
            HOW TO APPLY THE REVISION
          </AppText>
          <AppText variant="caption" color={currentTheme.textSecondary} style={{ marginBottom: 12 }}>
            Most Indian banks adjust EMI by default to maintain the original tenure.
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

          {form.errors.adjustmentStrategy && (
            <AppText variant="caption" color="#EF4444" style={{ marginTop: 6 }}>
              {form.errors.adjustmentStrategy}
            </AppText>
          )}

          {form.calculationResult.isNegativeAmortization && (
            <View style={styles.warningBox}>
              <AppIcon icon={AlertTriangle} size={18} color="#EF4444" />
              <AppText variant="caption" color="#EF4444" style={{ flex: 1, marginLeft: 8 }}>
                {form.calculationResult.warning}
              </AppText>
            </View>
          )}
        </AppCard>

        {/* Section 4: Live Impact Preview */}
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
                <View style={styles.impactRow}>
                  <AppText variant="caption" color={currentTheme.textSecondary}>Remaining Tenure:</AppText>
                  <AppText variant="caption" style={{ fontWeight: '600' }}>
                    Unchanged ({form.calculationResult.appliedNewTenureMonths} months)
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
                <View style={styles.impactRow}>
                  <AppText variant="caption" color={currentTheme.textSecondary}>Monthly EMI:</AppText>
                  <AppText variant="caption" style={{ fontWeight: '600' }}>
                    Unchanged ({formatCurrency(form.calculationResult.appliedNewEmi)})
                  </AppText>
                </View>
              </View>
            )}
          </AppCard>
        )}

        {/* Section 5: Optional Bank Override */}
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
                Optional: override if bank's exact EMI or tenure differs due to rounding
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
                  helperText="Leave empty to use Finzo's calculated EMI"
                />
              ) : (
                <TextInputField
                  label="Exact Bank Remaining Tenure (Months)"
                  placeholder={`e.g. ${form.calculationResult.calculatedNewTenureMonths || ''}`}
                  keyboardType="numeric"
                  value={form.exactNewTenureMonths}
                  onChangeText={form.setExactNewTenureMonths}
                  error={form.errors.exactNewTenureMonths}
                  helperText="Leave empty to use Finzo's calculated tenure"
                />
              )}
            </View>
          )}
        </AppCard>

        {/* Section 6: Notes */}
        <AppCard style={styles.card}>
          <TextInputField
            label="Notes / Remarks (Optional)"
            placeholder="e.g. RBI repo rate hike 25 bps, SBI EBLR reset"
            value={form.note}
            onChangeText={form.setNote}
            multiline
            numberOfLines={2}
          />
        </AppCard>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Save Rate Revision"
            onPress={handleSave}
            disabled={!form.calculationResult.isValid}
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
  boldText: {
    fontWeight: '700',
    marginTop: 2,
  },
  snapshotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
  },
  snapshotItem: {
    width: '50%',
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

export default AddRateRevisionScreen;
