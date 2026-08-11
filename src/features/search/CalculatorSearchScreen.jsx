import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Search, X } from 'lucide-react-native';
import ScreenContainer from '../../components/containers/ScreenContainer';
import AppText from '../../components/common/AppText';
import AppIcon from '../../components/common/AppIcon';
import CalculatorCard from '../../components/cards/CalculatorCard';
import EmptyState from '../../components/feedback/EmptyState';
import { useAppTheme } from '../../hooks/useAppTheme';
import { searchCalculators } from '../../calculators/search/calculatorSearch';
import { CALCULATOR_CATEGORIES } from '../../calculators/registry/calculatorCategories';

export const CalculatorSearchScreen = ({ navigation }) => {
  const { currentTheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const results = searchCalculators(query, undefined, selectedCategory);

  const handleClearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const renderHeader = () => (
    <View
      style={[
        styles.headerWrapper,
        {
          paddingTop: Math.max(insets.top + 12, 24),
          backgroundColor: currentTheme.surface,
          borderBottomColor: currentTheme.border,
        },
      ]}
    >
      <View style={styles.searchRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
          style={styles.backButton}
        >
          <AppIcon icon={ArrowLeft} size={22} color={currentTheme.textPrimary} />
        </TouchableOpacity>

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: currentTheme.background,
              borderColor: currentTheme.border,
            },
          ]}
        >
          <AppIcon icon={Search} size={18} color={currentTheme.textMuted} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search calculators (EMI, SIP, GST, FD...)"
            placeholderTextColor={currentTheme.textMuted}
            style={[styles.input, { color: currentTheme.textPrimary }]}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel="Calculator search input"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={handleClearQuery}
              activeOpacity={0.7}
              accessibilityLabel="Clear search input"
              style={styles.clearButton}
            >
              <AppIcon icon={X} size={16} color={currentTheme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScrollContent}
        style={styles.categoryScrollView}
      >
        <TouchableOpacity
          onPress={() => setSelectedCategory('all')}
          activeOpacity={0.7}
          style={[
            styles.chip,
            {
              backgroundColor: selectedCategory === 'all' ? currentTheme.primary : currentTheme.background,
              borderColor: selectedCategory === 'all' ? currentTheme.primary : currentTheme.border,
            },
          ]}
        >
          <AppText
            variant="caption"
            color={selectedCategory === 'all' ? '#FFFFFF' : currentTheme.textSecondary}
            style={styles.chipText}
          >
            All
          </AppText>
        </TouchableOpacity>

        {CALCULATOR_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              activeOpacity={0.7}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? currentTheme.primary : currentTheme.background,
                  borderColor: isSelected ? currentTheme.primary : currentTheme.border,
                },
              ]}
            >
              <AppText
                variant="caption"
                color={isSelected ? '#FFFFFF' : currentTheme.textSecondary}
                style={styles.chipText}
              >
                {cat.name}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <ScreenContainer
      header={renderHeader()}
      paddingHorizontal={0}
      useSafeAreaTop={false}
      useSafeAreaBottom={false}
      style={styles.container}
    >
      {results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            title="No calculators found"
            description={`No results matching "${query}". Try searching for EMI, SIP, Loan, GST, or FD.`}
            icon={Search}
          />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <CalculatorCard
              title={item.name}
              description={item.description}
              icon={item.icon}
              status={item.status}
              badgeText={item.badgeText}
              onPress={
                item.route ? () => navigation.navigate(item.route) : null
              }
              style={styles.cardMargin}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 6,
    marginRight: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  categoryScrollView: {
    marginTop: 12,
  },
  categoryScrollContent: {
    flexDirection: 'row',
    paddingRight: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
});

export default CalculatorSearchScreen;
