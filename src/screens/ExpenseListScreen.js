import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
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

const ExpenseListScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { expenses, todayExpenses, weekExpenses, monthExpenses, deleteExpense, settings } =
    useExpenses();

  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredExpenses = useMemo(() => {
    let list;
    switch (activeFilter) {
      case 'today': list = todayExpenses; break;
      case 'week':  list = weekExpenses;  break;
      case 'month': list = monthExpenses; break;
      default:      list = expenses;
    }
    if (selectedCategory) list = list.filter((e) => e.category === selectedCategory);
    return list;
  }, [activeFilter, selectedCategory, expenses, todayExpenses, weekExpenses, monthExpenses]);

  const grouped = useMemo(() => groupExpensesByDate(filteredExpenses), [filteredExpenses]);
  const total = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  const renderGroup = useCallback(
    ({ item: group }) => (
      <View>
        <View style={styles.dateHeader}>
          <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
            {group.displayDate}
          </Text>
          <Text style={[styles.dateTotal, { color: colors.primary }]}>
            {formatCurrency(group.total, settings.currency)}
          </Text>
        </View>
        {group.items.map((exp) => (
          <ExpenseItem
            key={exp.id}
            expense={exp}
            currency={settings.currency}
            onPress={() => navigation.navigate('AddExpense', { expense: exp, mode: 'edit' })}
            onDelete={deleteExpense}
          />
        ))}
      </View>
    ),
    [colors, settings.currency, deleteExpense, navigation]
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Expenses</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Search')}
            style={[styles.searchBtn, { backgroundColor: colors.surfaceSecondary }]}
          >
            <MaterialIcons name="search" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.id}
              onPress={() => setActiveFilter(f.id)}
              style={[
                styles.filterTab,
                {
                  backgroundColor: activeFilter === f.id ? colors.primary : colors.surfaceSecondary,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: activeFilter === f.id ? '#FFFFFF' : colors.textSecondary,
                    fontWeight: activeFilter === f.id ? FontWeight.semiBold : FontWeight.regular,
                  },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Total Summary */}
        <View
          style={[styles.totalBar, { backgroundColor: colors.card, borderBottomColor: colors.separator }]}
        >
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
            {filteredExpenses.length} transactions
          </Text>
          <Text style={[styles.totalAmount, { color: colors.text }]}>
            Total: {formatCurrency(total, settings.currency)}
          </Text>
        </View>

        {/* List */}
        {grouped.length === 0 ? (
          <EmptyState
            icon="receipt-long"
            title="No expenses found"
            subtitle="Try a different filter or add new expenses"
            actionLabel="Add Expense"
            onAction={() => navigation.navigate('AddExpense', { mode: 'add' })}
          />
        ) : (
          <FlatList
            data={grouped}
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
  searchBtn: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
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
  totalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    marginBottom: Spacing.sm,
  },
  totalLabel: {
    fontSize: FontSize.sm,
  },
  totalAmount: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
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

export default ExpenseListScreen;