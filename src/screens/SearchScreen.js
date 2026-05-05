import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/common/EmptyState';
import ExpenseItem from '../components/expense/ExpenseItem';
import Input from '../components/common/Input';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, Layout, Spacing } from '../theme/spacing';
import { FontSize, FontWeight } from '../theme/typography';
import { formatCurrency, groupExpensesByDate } from '../utils/formatters';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
];

const SearchScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { searchExpenses, expenses, todayExpenses, weekExpenses, monthExpenses, settings } =
    useExpenses();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredByDate = useMemo(() => {
    switch (activeFilter) {
      case 'today':
        return todayExpenses;
      case 'week':
        return weekExpenses;
      case 'month':
        return monthExpenses;
      default:
        return expenses;
    }
  }, [activeFilter, expenses, todayExpenses, weekExpenses, monthExpenses]);

  const results = useMemo(() => {
    if (!query.trim()) return filteredByDate;
    const matched = searchExpenses(query);
    return filteredByDate.filter((expense) => matched.some((item) => item.id === expense.id));
  }, [query, filteredByDate, searchExpenses]);

  const groupedResults = useMemo(() => groupExpensesByDate(results), [results]);

  const renderGroup = ({ item: group }) => (
    <View>
      <View style={styles.dateHeader}>
        <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>{group.displayDate}</Text>
        <Text style={[styles.dateTotal, { color: colors.primary }]}> 
          {formatCurrency(group.total, settings.currency)}
        </Text>
      </View>
      {group.items.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          currency={settings.currency}
          onPress={() => navigation.navigate('AddExpense', { expense, mode: 'edit' })}
          onDelete={() => {}}
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}> 
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}> 
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.surfaceSecondary }]}> 
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Search Expenses</Text>
          <View style={{ width: 42 }} />
        </View>

        <View style={styles.searchRow}>
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder="Search by category or note"
            icon="search"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.filterRow}> 
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              onPress={() => setActiveFilter(filter.id)}
              style={[
                styles.filterTab,
                {
                  backgroundColor:
                    activeFilter === filter.id ? colors.primary : colors.surfaceSecondary,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: activeFilter === filter.id ? '#FFFFFF' : colors.textSecondary,
                    fontWeight: activeFilter === filter.id ? FontWeight.semiBold : FontWeight.regular,
                  },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {groupedResults.length === 0 ? (
          <EmptyState
            icon="search-off"
            title={query.trim() ? 'No results found' : 'No expenses yet'}
            subtitle={
              query.trim()
                ? 'Try another keyword or filter.'
                : 'Add a new expense to see it here.'
            }
            actionLabel="Add Expense"
            onAction={() => navigation.navigate('AddExpense', { mode: 'add' })}
          />
        ) : (
          <FlatList
            data={groupedResults}
            keyExtractor={(item) => item.date}
            renderItem={renderGroup}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    borderRadius: BorderRadius['2xl'],
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  filterTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  filterText: {
    fontSize: FontSize.sm,
  },
  list: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Layout.tabBarHeight + Spacing.xl,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  dateLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
  },
  dateTotal: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
});

export default SearchScreen;
