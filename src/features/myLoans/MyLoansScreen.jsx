import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, ShieldAlert, Bookmark, Star } from 'lucide-react-native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import AppText from '../../components/common/AppText';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import EmptyState from '../../components/feedback/EmptyState';
import { formatCurrencyCompact } from '../../utils/financeFormatters';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ROUTES } from '../../navigation/routes';
import AdPlacement from '../../components/ads/AdPlacement';
import { AD_PLACEMENTS } from '../../services/ads/adPlacementConstants';
import { getCalculatorById } from '../../calculators';

// Loan Slice & Components
import {
  selectActiveLoanProfiles,
  selectTotalOriginalLoanAmount,
  selectTotalOutstanding,
  selectTotalPrincipalPaid,
  selectTotalMonthlyEMI,
  selectActiveLoanCount,
} from '../../store/slices/loanProfilesSlice';
import LoanDashboardSummary from '../loans/components/LoanDashboardSummary';
import LoanProfileCard from '../loans/components/LoanProfileCard';
import UpcomingPaymentCard from '../loans/components/UpcomingPaymentCard';
import { PAYMENT_TYPES } from '../loans/constants/loanPaymentConstants';

// Saved Slice & Components
import {
  selectSavedCalculations,
  toggleFavorite,
  deleteSavedCalculation,
} from '../../store/slices/savedCalculationsSlice';
import SavedCalculationCard from '../saved/components/SavedCalculationCard';
import {
  getExportModelForCalculator,
  shareCalculationText,
  generateCalculationPdf,
  shareCalculationPdfFile,
  ExportPdfModal,
} from '../share';

export const MyLoansScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { currentTheme } = useAppTheme();
  const insets = useSafeAreaInsets();

  // Segment State: 'loans' | 'saved'
  const initialSeg = route?.params?.initialSegment || 'loans';
  const [activeSegment, setActiveSegment] = useState(initialSeg);

  // Saved Filter Mode: 'all' | 'favorites'
  const [savedFilterMode, setSavedFilterMode] = useState('all');

  // PDF Export Modal State
  const [selectedSavedItemForPdf, setSelectedSavedItemForPdf] = useState(null);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Sync segment if route params change
  useEffect(() => {
    if (route?.params?.initialSegment) {
      setActiveSegment(route.params.initialSegment);
    }
  }, [route?.params?.initialSegment]);

  // 1. Real Loans Data
  const activeLoans = useSelector(selectActiveLoanProfiles);
  const totalOriginalLoanAmount = useSelector(selectTotalOriginalLoanAmount);
  const totalOutstanding = useSelector(selectTotalOutstanding);
  const totalPrincipalPaid = useSelector(selectTotalPrincipalPaid);
  const totalMonthlyEMI = useSelector(selectTotalMonthlyEMI);
  const activeCount = useSelector(selectActiveLoanCount);
  const allPayments = useSelector((state) => state.loanPayments?.payments || []);
  const primaryOrUrgentLoan = activeLoans.find((l) => l.isPrimary) || activeLoans[0] || null;
  const bottomListPadding = Math.max(insets.bottom + 80, 100);

  // 2. Saved Calculations Data
  const savedCalculations = useSelector(selectSavedCalculations);
  const filteredSavedItems =
    savedFilterMode === 'favorites'
      ? savedCalculations.filter(item => item.isFavorite)
      : savedCalculations;
  const favoriteCount = savedCalculations.filter(
    item => item.isFavorite,
  ).length;

  // Saved Actions
  const handleOpenSavedItem = item => {
    const calcMetadata = getCalculatorById(item.calculatorId);
    if (!calcMetadata || !calcMetadata.route) {
      Alert.alert(
        'Calculator Unavailable',
        'This calculator is no longer available in the app catalog.',
      );
      return;
    }
    navigation.navigate(calcMetadata.route, {
      savedCalculation: item,
    });
  };

  const handleToggleFavorite = id => {
    dispatch(toggleFavorite(id));
  };

  const handleDeleteSavedItem = item => {
    Alert.alert(
      'Delete Calculation?',
      `"${item.title || 'Calculation'}" will be permanently removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteSavedCalculation(item.id)),
        },
      ],
    );
  };

  const handleShareSavedItem = async item => {
    try {
      const exportModel = getExportModelForCalculator(
        item.calculatorId,
        item.inputs,
        item.result,
        { customTitle: item.title, date: item.savedAt || item.updatedAt },
      );
      await shareCalculationText(exportModel);
    } catch (err) {
      Alert.alert('Share Failed', err.message);
    }
  };

  const handlePdfSavedItem = item => {
    setSelectedSavedItemForPdf(item);
    setPdfModalVisible(true);
  };

  const handlePdfExportConfirm = async mode => {
    if (!selectedSavedItemForPdf) return;
    setIsGeneratingPdf(true);
    const targetItem = selectedSavedItemForPdf;
    try {
      const exportModel = getExportModelForCalculator(
        targetItem.calculatorId,
        targetItem.inputs,
        targetItem.result,
        {
          customTitle: targetItem.title,
          date: targetItem.savedAt || targetItem.updatedAt,
          mode,
        },
      );
      const pdfPath = await generateCalculationPdf({ exportModel, mode });
      setPdfModalVisible(false);
      setIsGeneratingPdf(false);
      setSelectedSavedItemForPdf(null);

      setTimeout(async () => {
        try {
          await shareCalculationPdfFile(pdfPath, exportModel.title);
        } catch (err) {
          Alert.alert('Share PDF Failed', err.message);
        }
      }, 350);
    } catch (err) {
      setIsGeneratingPdf(false);
      Alert.alert('PDF Export Failed', err.message);
    }
  };

  // Render Header
  const renderHeader = () => (
    <View
      style={[
        styles.headerGroup,
        { paddingTop: Math.max(insets.top + 12, 24) },
      ]}
    >
      <AppText variant="screenTitle">My Loans</AppText>
      <AppText
        variant="bodySmall"
        color={currentTheme.textSecondary}
        style={styles.subtitleMargin}
      >
        Your loans and saved calculations in one place.
      </AppText>

      {/* Main Segment Switcher: [ Loans ] [ Saved ] */}
      <View
        style={[
          styles.mainSegmentBg,
          { backgroundColor: currentTheme.surfaceVariant },
        ]}
      >
        <TouchableOpacity
          onPress={() => setActiveSegment('loans')}
          activeOpacity={0.7}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeSegment === 'loans' }}
          accessibilityLabel="Loans tab"
          style={[
            styles.mainSegmentBtn,
            activeSegment === 'loans' && [
              styles.mainSegmentActive,
              { backgroundColor: currentTheme.surface },
            ],
          ]}
        >
          <AppText
            variant="bodySmall"
            color={
              activeSegment === 'loans'
                ? currentTheme.primary
                : currentTheme.textSecondary
            }
            style={{ fontWeight: activeSegment === 'loans' ? '700' : '500' }}
          >
            Loans ({activeCount})
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveSegment('saved')}
          activeOpacity={0.7}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeSegment === 'saved' }}
          accessibilityLabel="Saved calculations tab"
          style={[
            styles.mainSegmentBtn,
            activeSegment === 'saved' && [
              styles.mainSegmentActive,
              { backgroundColor: currentTheme.surface },
            ],
          ]}
        >
          <AppText
            variant="bodySmall"
            color={
              activeSegment === 'saved'
                ? currentTheme.primary
                : currentTheme.textSecondary
            }
            style={{ fontWeight: activeSegment === 'saved' ? '700' : '500' }}
          >
            Saved ({savedCalculations.length})
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer
      header={renderHeader()}
      paddingHorizontal={0}
      contentContainerStyle={{ paddingVertical: 0 }}
      useSafeAreaTop={false}
      useSafeAreaBottom={false}
      style={styles.container}
    >
      {/* SEGMENT 1: LOANS */}
      {activeSegment === 'loans' && (
        <FlatList
          data={activeLoans}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: 10 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            activeCount > 0 ? (
              <View>
                <LoanDashboardSummary
                  totalOriginalLoanAmount={totalOriginalLoanAmount}
                  totalOutstanding={totalOutstanding}
                  totalMonthlyEMI={totalMonthlyEMI}
                  totalPrincipalPaid={totalPrincipalPaid}
                  activeCount={activeCount}
                />
                {primaryOrUrgentLoan && (
                  <UpcomingPaymentCard
                    loan={primaryOrUrgentLoan}
                    payments={allPayments}
                    onRecordPayment={() =>
                      navigation.navigate(ROUTES.ADD_PAYMENT, {
                        loanId: primaryOrUrgentLoan.id,
                        initialValues: {
                          paymentType: PAYMENT_TYPES.REGULAR_EMI,
                          useScheduledEmi: true,
                        },
                      })
                    }
                    onOpenSettings={() =>
                      navigation.navigate(ROUTES.LOAN_DETAILS, { loanId: primaryOrUrgentLoan.id })
                    }
                  />
                )}
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <LoanProfileCard
              profile={item}
              onPress={() =>
                navigation.navigate(ROUTES.LOAN_DETAILS, { loanId: item.id })
              }
            />
          )}
          ListFooterComponent={
            activeCount > 0 ? (
              <View style={styles.addAnotherContainer}>
                <PrimaryButton
                  title="Add Another Loan"
                  icon={Plus}
                  onPress={() => navigation.navigate(ROUTES.ADD_LOAN)}
                  accessibilityLabel="Add another loan"
                />
                <AdPlacement
                  screen="myLoans"
                  placementId={AD_PLACEMENTS.MY_LOANS_BANNER}
                  adType="banner"
                  style={{ marginTop: 12 }}
                />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <EmptyState
                icon={ShieldAlert}
                title="Track Your Loans"
                description="Add your existing loans to Finzo to keep your loan information organized."
              />
              <PrimaryButton
                title="Add Your First Loan"
                icon={Plus}
                onPress={() => navigation.navigate(ROUTES.ADD_LOAN)}
                style={styles.emptyAddBtn}
                accessibilityLabel="Add your first loan"
              />
            </View>
          }
        />
      )}

      {/* SEGMENT 2: SAVED CALCULATIONS */}
      {activeSegment === 'saved' && (
        <View style={styles.savedSegmentContainer}>
          {/* Saved Filter Sub-Chips */}
          {savedCalculations.length > 0 && (
            <View style={styles.savedFilterRow}>
              <TouchableOpacity
                onPress={() => setSavedFilterMode('all')}
                activeOpacity={0.7}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      savedFilterMode === 'all'
                        ? currentTheme.primary
                        : currentTheme.surface,
                    borderColor:
                      savedFilterMode === 'all'
                        ? currentTheme.primary
                        : currentTheme.border,
                  },
                ]}
              >
                <AppText
                  variant="caption"
                  color={
                    savedFilterMode === 'all'
                      ? '#FFFFFF'
                      : currentTheme.textPrimary
                  }
                  style={{
                    fontWeight: savedFilterMode === 'all' ? '700' : '500',
                  }}
                >
                  All ({savedCalculations.length})
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSavedFilterMode('favorites')}
                activeOpacity={0.7}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      savedFilterMode === 'favorites'
                        ? currentTheme.primary
                        : currentTheme.surface,
                    borderColor:
                      savedFilterMode === 'favorites'
                        ? currentTheme.primary
                        : currentTheme.border,
                  },
                ]}
              >
                <AppText
                  variant="caption"
                  color={
                    savedFilterMode === 'favorites'
                      ? '#FFFFFF'
                      : currentTheme.textPrimary
                  }
                  style={{
                    fontWeight: savedFilterMode === 'favorites' ? '700' : '500',
                  }}
                >
                  Favorites ({favoriteCount})
                </AppText>
              </TouchableOpacity>
            </View>
          )}

          {filteredSavedItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState
                title={
                  savedFilterMode === 'favorites'
                    ? 'No favorite calculations'
                    : 'No saved calculations'
                }
                description={
                  savedFilterMode === 'favorites'
                    ? 'Star a saved calculation to pin it to your favorites list.'
                    : 'Save calculations from any tool to quickly return to them later.'
                }
                icon={savedFilterMode === 'favorites' ? Star : Bookmark}
              />
            </View>
          ) : (
            <FlatList
              data={filteredSavedItems}
              keyExtractor={item => item.id}
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: bottomListPadding },
              ]}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <SavedCalculationCard
                  item={item}
                  onPress={() => handleOpenSavedItem(item)}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDeleteSavedItem}
                  onShare={handleShareSavedItem}
                  onPdf={handlePdfSavedItem}
                />
              )}
            />
          )}
        </View>
      )}

      {/* PDF Export Modal */}
      <ExportPdfModal
        visible={pdfModalVisible}
        isGenerating={isGeneratingPdf}
        onClose={() => {
          setPdfModalVisible(false);
          setSelectedSavedItemForPdf(null);
        }}
        onExport={handlePdfExportConfirm}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGroup: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  subtitleMargin: {
    marginTop: 2,
    marginBottom: 12,
  },
  mainSegmentBg: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  mainSegmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  mainSegmentActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  savedSegmentContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  addAnotherContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  emptyContainer: {
    paddingTop: 32,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyAddBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
  },
  savedFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
});

export default MyLoansScreen;
