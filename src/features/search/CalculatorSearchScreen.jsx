import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
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
          paddingTop: Math.max(insets.top, 8),
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
            placeholder="Search calculators (EMI, SIP, GST...)"
            placeholderTextColor={currentTheme.textMuted}
            style={[styles.textInput, { color: currentTheme.textPrimary }]}
            returnKeyType="search"
            clearButtonMode="never"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={handleClearQuery}
              activeOpacity={0.7}
              accessibilityLabel="Clear search"
              style={styles.clearButton}
            >
              <AppIcon icon={X} size={16} color={currentTheme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter Chips Row */}
      <View style={styles.categoryRow}>
        <TouchableOpacity
          onPress={() => setSelectedCategory('all')}
          activeOpacity={0.7}
          style={[
            styles.categoryChip,
            {
              backgroundColor: selectedCategory === 'all' ? currentTheme.primary : currentTheme.surface,
              borderColor: selectedCategory === 'all' ? currentTheme.primary : currentTheme.border,
            },
          ]}
        >
          <AppText
            variant="caption"
            color={selectedCategory === 'all' ? '#FFFFFF' : currentTheme.textPrimary}
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
                styles.categoryChip,
                {
                  backgroundColor: isSelected ? currentTheme.primary : currentTheme.surface,
                  borderColor: isSelected ? currentTheme.primary : currentTheme.border,
                },
              ]}
            >
              <AppText
                variant="caption"
                color={isSelected ? '#FFFFFF' : currentTheme.textPrimary}
                style={styles.chipText}
              >
                {cat.name}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <ScreenContainer
      header={renderHeader()}
      useSafeAreaTop={false}
      useSafeAreaBottom={false}
      style={styles.container}
    >
      <View style={styles.resultsCountHeader}>
        <AppText variant="caption" color={currentTheme.textSecondary}>
          {results.length} {results.length === 1 ? 'calculator' : 'calculators'} found
        </AppText>
      </View>

      {results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            title="No calculators found"
            description="Try searching for EMI, SIP, GST, interest, or percentage."
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
    paddingBottom: 16,
  },
  headerWrapper: {
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
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
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontWeight: '500',
  },
  clearButton: {
    padding: 6,
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 6,
  },
  chipText: {
    fontWeight: '600',
  },
  resultsCountHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  cardMargin: {
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
});

export default CalculatorSearchScreen;
