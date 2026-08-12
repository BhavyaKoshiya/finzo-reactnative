import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, ChevronRight, Plus, Landmark } from 'lucide-react-native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import AppText from '../../components/common/AppText';
import AppIcon from '../../components/common/AppIcon';
import AppCard from '../../components/cards/AppCard';
import CalculatorCard from '../../components/cards/CalculatorCard';
import CategoryCard from '../../components/cards/CategoryCard';
import SavedCalculationCard from '../saved/components/SavedCalculationCard';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ROUTES } from '../../navigation/routes';
import { getPopularCalculators, getCalculatorCategories, getCalculatorById } from '../../calculators';
import {
  selectSavedCalculations,
  toggleFavorite,
  deleteSavedCalculation,
} from '../../store/slices/savedCalculationsSlice';
import { selectPrimaryLoan } from '../../store/slices/loanProfilesSlice';
import { adaptLoanProfileForDisplay } from '../loans/utils/loanPresentationAdapters';

import {
  getExportModelForCalculator,
  shareCalculationText,
  generateCalculationPdf,
  shareCalculationPdfFile,
  ExportPdfModal,
} from '../share';

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 22) return 'Good Evening';
  return 'Good Night';
};

export const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { currentTheme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [selectedSavedItemForPdf, setSelectedSavedItemForPdf] = useState(null);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const popularCalculators = getPopularCalculators();
  const categories = getCalculatorCategories();
  const savedCalculations = useSelector(selectSavedCalculations);
  const recentSavedCalculations = savedCalculations.slice(0, 3);

  const primaryLoanRaw = useSelector(selectPrimaryLoan);
  const primaryLoan = adaptLoanProfileForDisplay(primaryLoanRaw);

  const handleToggleFavorite = (id) => {
    dispatch(toggleFavorite(id));
  };

  const handleDeleteSavedItem = (item) => {
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

  const handleOpenSavedItem = (item) => {
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

  const handleShareSavedItem = async (item) => {
    try {
      const exportModel = getExportModelForCalculator(
        item.calculatorId,
        item.inputs,
        item.result,
        { customTitle: item.title, date: item.savedAt || item.updatedAt }
      );
      await shareCalculationText(exportModel);
    } catch (err) {
      Alert.alert('Share Failed', err.message);
    }
  };

  const handlePdfSavedItem = (item) => {
    setSelectedSavedItemForPdf(item);
    setPdfModalVisible(true);
  };

  const handlePdfExportConfirm = async (mode) => {
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
        }
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

  const renderHeader = () => (
    <View style={[styles.heroSection, { paddingTop: Math.max(insets.top + 12, 24), backgroundColor: currentTheme.background }]}>
      <AppText variant="caption" color={currentTheme.primary} style={styles.brandTitle}>
        FINZO
      </AppText>
      <AppText variant="screenTitle" style={styles.greetingTitle}>
        {getTimeBasedGreeting()}
      </AppText>
      <AppText variant="bodySmall" color={currentTheme.textSecondary}>
        What would you like to calculate today?
      </AppText>
    </View>
  );

  return (
    <ScreenContainer
      scrollable
      header={renderHeader()}
      useSafeAreaTop={false}
      useSafeAreaBottom={false}
      style={styles.container}
    >
      {/* Quick Search Entry */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate(ROUTES.CALCULATOR_SEARCH)}
        accessibilityRole="search"
        accessibilityLabel="Search calculators"
        style={[
          styles.searchBar,
          { backgroundColor: currentTheme.surface, borderColor: currentTheme.border },
        ]}
      >
        <AppIcon icon={Search} size={20} color={currentTheme.textMuted} style={styles.searchIcon} />
        <AppText variant="bodySmall" color={currentTheme.textMuted}>
          Search calculators (EMI, SIP, GST, FD...)
        </AppText>
      </TouchableOpacity>

      {/* Primary Loan Widget (Requirement 28) */}
      <View style={styles.loanWidgetSection}>
        {primaryLoan ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate(ROUTES.LOAN_DETAILS, { loanId: primaryLoan.id })}
          >
            <AppCard style={[styles.loanWidgetCard, { backgroundColor: currentTheme.primaryLight }]}>
              <View style={styles.loanWidgetHeader}>
                <View style={styles.loanWidgetTitleRow}>
                  <AppIcon icon={primaryLoan.loanTypeIcon} size={18} color={currentTheme.primary} style={{ marginRight: 6 }} />
                  <AppText variant="bodyMedium" style={{ fontWeight: '700' }} numberOfLines={1}>
                    {primaryLoan.name}
                  </AppText>
                </View>
                <View style={styles.viewLoanBtn}>
                  <AppText variant="caption" color={currentTheme.primary} style={{ fontWeight: '700', marginRight: 2 }}>
                    View Loan
                  </AppText>
                  <AppIcon icon={ChevronRight} size={14} color={currentTheme.primary} />
                </View>
              </View>

              <View style={styles.loanWidgetBody}>
                <View>
                  <AppText variant="caption" color={currentTheme.textSecondary}>
                    Outstanding Balance
                  </AppText>
                  <AppText variant="titleMedium" color={currentTheme.textPrimary} style={{ fontWeight: '800' }}>
                    {primaryLoan.formattedCurrentOutstanding}
                  </AppText>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <AppText variant="caption" color={currentTheme.textSecondary}>
                    Monthly EMI
                  </AppText>
                  <AppText variant="bodyMedium" color={currentTheme.primary} style={{ fontWeight: '700' }}>
                    {primaryLoan.formattedEmiAmount}
                  </AppText>
                </View>
              </View>
            </AppCard>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate(ROUTES.LOAN_DASHBOARD)}
          >
            <AppCard style={styles.trackLoanBanner}>
              <View style={styles.trackLoanLeft}>
                <AppIcon icon={Landmark} size={20} color={currentTheme.primary} style={{ marginRight: 10 }} />
                <View>
                  <AppText variant="bodyMedium" style={{ fontWeight: '600' }}>
                    Track Your Real Loans
                  </AppText>
                  <AppText variant="caption" color={currentTheme.textSecondary}>
                    Manage your home, personal or car loan EMIs in Finzo
                  </AppText>
                </View>
              </View>
              <AppIcon icon={Plus} size={18} color={currentTheme.primary} />
            </AppCard>
          </TouchableOpacity>
        )}
      </View>

      {/* Saved Calculations Section */}
      {recentSavedCalculations.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="sectionTitle">Recent Calculations</AppText>
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.SAVED)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="View all saved calculations"
              style={styles.viewAllRow}
            >
              <AppText variant="caption" color={currentTheme.primary} style={styles.viewAllText}>
                View All
              </AppText>
              <AppIcon icon={ChevronRight} size={14} color={currentTheme.primary} />
            </TouchableOpacity>
          </View>
          {recentSavedCalculations.map((item) => (
            <SavedCalculationCard
              key={item.id}
              item={item}
              onPress={() => handleOpenSavedItem(item)}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDeleteSavedItem}
              onShare={handleShareSavedItem}
              onPdf={handlePdfSavedItem}
            />
          ))}
        </View>
      )}

      {/* Popular Calculators Section */}
      <View style={styles.section}>
        <AppText variant="sectionTitle" style={styles.sectionTitle}>
          Popular Calculators
        </AppText>
        {popularCalculators.map((calc) => (
          <CalculatorCard
            key={calc.id}
            title={calc.name}
            description={calc.description}
            icon={calc.icon}
            status={calc.status}
            onPress={
              calc.route ? () => navigation.navigate(calc.route) : null
            }
            style={styles.cardMargin}
          />
        ))}
      </View>

      {/* Categories Section */}
      <View style={styles.lastSection}>
        <AppText variant="sectionTitle" style={styles.sectionTitle}>
          Explore Categories
        </AppText>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              variant="grid"
              title={cat.name}
              count={cat.count}
              icon={cat.icon}
              onPress={() => navigation.navigate(ROUTES.CALCULATORS)}
              style={styles.gridCard}
            />
          ))}
        </View>
      </View>

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
    paddingBottom: 8,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  brandTitle: {
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  greetingTitle: {
    marginBottom: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  loanWidgetSection: {
    marginBottom: 20,
  },
  loanWidgetCard: {
    padding: 14,
    borderRadius: 14,
  },
  loanWidgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  loanWidgetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  viewLoanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loanWidgetBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(59, 130, 246, 0.2)',
  },
  trackLoanBanner: {
    padding: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackLoanLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  lastSection: {
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontWeight: '600',
    marginRight: 2,
  },
  cardMargin: {
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    marginBottom: 12,
  },
});

export default HomeScreen;
