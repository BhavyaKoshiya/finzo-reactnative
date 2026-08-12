import React from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, Edit3, Archive, Trash2, Calendar, Landmark, Star, StarOff } from 'lucide-react-native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import AppHeader from '../../../components/navigation/AppHeader';
import AppText from '../../../components/common/AppText';
import AppCard from '../../../components/cards/AppCard';
import AppIcon from '../../../components/common/AppIcon';
import PrimaryButton from '../../../components/buttons/PrimaryButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import { useAppTheme } from '../../../hooks/useAppTheme';
import {
  selectLoanProfileById,
  deleteLoanProfile,
  archiveLoanProfile,
  setPrimaryLoan,
} from '../../../store/slices/loanProfilesSlice';
import { adaptLoanProfileForDisplay } from '../utils/loanPresentationAdapters';
import { ROUTES } from '../../../navigation/routes';

export const LoanDetailsScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { currentTheme } = useAppTheme();

  const loanId = route?.params?.loanId;
  const rawProfile = useSelector((state) => selectLoanProfileById(state, loanId));
  const profile = adaptLoanProfileForDisplay(rawProfile);

  if (!profile) {
    return (
      <ScreenContainer
        header={
          <AppHeader
            title="Loan Details"
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

  const handleDeletePress = () => {
    Alert.alert(
      `Delete ${profile.name}?`,
      'Are you sure you want to delete this loan profile? This action will remove it permanently from your app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Loan',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteLoanProfile(profile.id));
            Alert.alert('Loan Deleted', `${profile.name} has been removed.`);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleArchiveToggle = () => {
    const isArchived = profile.status === 'archived';
    dispatch(archiveLoanProfile({ id: profile.id, archive: !isArchived }));
    Alert.alert(
      isArchived ? 'Loan Restored' : 'Loan Archived',
      isArchived
        ? `${profile.name} is now active.`
        : `${profile.name} has been archived.`
    );
  };

  const handleSetPrimaryToggle = () => {
    if (profile.isPrimary) return;
    dispatch(setPrimaryLoan(profile.id));
    Alert.alert('Primary Loan Set', `${profile.name} is now your primary loan.`);
  };

  const renderHeader = () => (
    <AppHeader
      title={profile.name}
      subtitle={profile.lenderName || profile.loanTypeLabel}
      leftAction={{
        icon: ArrowLeft,
        onPress: () => navigation.goBack(),
        accessibilityLabel: 'Go back',
      }}
      rightAction={{
        icon: Edit3,
        onPress: () => navigation.navigate(ROUTES.EDIT_LOAN, { loanId: profile.id }),
        accessibilityLabel: 'Edit loan',
      }}
    />
  );

  return (
    <ScreenContainer
      scrollable
      header={renderHeader()}
      useSafeAreaTop={false}
      useSafeAreaBottom={false}
      style={styles.container}
    >
      {/* Overview Card */}
      <AppCard style={[styles.overviewCard, { backgroundColor: currentTheme.primary }]}>
        <View style={styles.overviewTopRow}>
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <AppIcon icon={profile.loanTypeIcon} size={14} color="#FFFFFF" />
              <AppText variant="caption" color="#FFFFFF" style={styles.typeText}>
                {profile.loanTypeLabel}
              </AppText>
            </View>

            {profile.isPrimary ? (
              <View style={styles.primaryPill}>
                <AppIcon icon={Star} size={11} color="#FFFFFF" />
                <AppText variant="caption" color="#FFFFFF" style={{ fontWeight: '700' }}>
                  Primary
                </AppText>
              </View>
            ) : profile.status === 'active' ? (
              <TouchableOpacity onPress={handleSetPrimaryToggle} activeOpacity={0.7} style={styles.makePrimaryBtn}>
                <AppIcon icon={StarOff} size={11} color="rgba(255,255,255,0.8)" />
                <AppText variant="caption" color="rgba(255,255,255,0.9)">
                  Set as Primary
                </AppText>
              </TouchableOpacity>
            ) : null}
          </View>

          {profile.status === 'archived' && (
            <View style={styles.archivedBadge}>
              <AppText variant="caption" color="#FFFFFF" style={{ fontWeight: '700' }}>
                Archived
              </AppText>
            </View>
          )}
        </View>

        <AppText variant="caption" color="rgba(255, 255, 255, 0.8)" style={styles.labelMargin}>
          Current Outstanding Balance
        </AppText>
        <AppText variant="h2" color="#FFFFFF" style={styles.outstandingAmount}>
          {profile.formattedCurrentOutstanding}
        </AppText>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                { width: `${Math.min(100, profile.repaymentPercentage)}%` },
              ]}
            />
          </View>
          <AppText variant="caption" color="rgba(255, 255, 255, 0.85)" style={styles.progressText}>
            {profile.progressText}
          </AppText>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.overviewBottomGrid}>
          <View style={styles.gridCol}>
            <AppText variant="caption" color="rgba(255, 255, 255, 0.8)">
              Monthly EMI
            </AppText>
            <AppText variant="titleMedium" color="#FFFFFF" style={styles.boldVal}>
              {profile.formattedEmiAmount}
            </AppText>
          </View>

          <View style={styles.gridCol}>
            <AppText variant="caption" color="rgba(255, 255, 255, 0.8)">
              Interest Rate
            </AppText>
            <AppText variant="titleMedium" color="#FFFFFF" style={styles.boldVal}>
              {profile.formattedInterestRate}
            </AppText>
          </View>
        </View>
      </AppCard>

      {/* Details Breakdown Card */}
      <AppCard style={styles.detailsCard}>
        <AppText variant="cardTitle" style={styles.cardTitle}>
          Loan Account Details
        </AppText>

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <AppIcon icon={Landmark} size={18} color={currentTheme.textSecondary} />
            <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabel}>
              Lender Name
            </AppText>
          </View>
          <AppText variant="bodyMedium" style={styles.detailValue}>
            {profile.lenderName || 'N/A'}
          </AppText>
        </View>

        <View style={styles.detailRow}>
          <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelIndent}>
            Original Loan Amount
          </AppText>
          <AppText variant="bodyMedium" style={styles.detailValue}>
            {profile.formattedOriginalPrincipal}
          </AppText>
        </View>

        <View style={styles.detailRow}>
          <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelIndent}>
            Original Tenure
          </AppText>
          <AppText variant="bodyMedium" style={styles.detailValue}>
            {profile.originalTenureText}
          </AppText>
        </View>

        <View style={styles.detailRow}>
          <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelIndent}>
            Remaining Tenure
          </AppText>
          <AppText variant="bodyMedium" style={styles.detailValue}>
            {profile.remainingTenureText}
          </AppText>
        </View>

        <View style={styles.detailRow}>
          <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelIndent}>
            Loan Start Date
          </AppText>
          <AppText variant="bodyMedium" style={styles.detailValue}>
            {profile.formattedStartDate}
          </AppText>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <AppIcon icon={Calendar} size={18} color={currentTheme.primary} />
            <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabel}>
              Next EMI Due Date
            </AppText>
          </View>
          <AppText variant="bodyMedium" color={currentTheme.primary} style={[styles.detailValue, { fontWeight: '700' }]}>
            {profile.nextEmiInfo?.formattedDate}
          </AppText>
        </View>

        {profile.processingFee > 0 && (
          <View style={styles.detailRow}>
            <AppText variant="bodyMedium" color={currentTheme.textSecondary} style={styles.detailLabelIndent}>
              Processing Fee
            </AppText>
            <AppText variant="bodyMedium" style={styles.detailValue}>
              {profile.formattedProcessingFee}
            </AppText>
          </View>
        )}

        {profile.notes ? (
          <View style={styles.notesContainer}>
            <AppText variant="caption" color={currentTheme.textSecondary}>
              Notes / Remarks
            </AppText>
            <AppText variant="bodySmall" color={currentTheme.textPrimary} style={styles.notesText}>
              {profile.notes}
            </AppText>
          </View>
        ) : null}
      </AppCard>

      {/* Action Buttons */}
      <View style={styles.actionsGroup}>
        <PrimaryButton
          title="Edit Loan Profile"
          icon={Edit3}
          onPress={() => navigation.navigate(ROUTES.EDIT_LOAN, { loanId: profile.id })}
        />

        <SecondaryButton
          title={profile.status === 'archived' ? 'Unarchive Loan' : 'Archive Loan'}
          icon={Archive}
          onPress={handleArchiveToggle}
        />

        <SecondaryButton
          title="Delete Loan Profile"
          icon={Trash2}
          onPress={handleDeletePress}
          style={{ borderColor: currentTheme.error }}
          textStyle={{ color: currentTheme.error }}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  notFound: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  overviewCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  overviewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  typeText: {
    fontWeight: '600',
  },
  primaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  makePrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  archivedBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  labelMargin: {
    marginTop: 4,
  },
  outstandingAmount: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 14,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 6,
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 14,
  },
  overviewBottomGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridCol: {
    flex: 1,
  },
  boldVal: {
    fontWeight: '700',
    marginTop: 2,
  },
  detailsCard: {
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    marginLeft: 8,
  },
  detailLabelIndent: {
    marginLeft: 0,
  },
  detailValue: {
    fontWeight: '600',
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  notesText: {
    marginTop: 4,
  },
  actionsGroup: {
    gap: 12,
  },
});

export default LoanDetailsScreen;
