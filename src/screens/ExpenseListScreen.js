import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/common/EmptyState';
import ExpenseItem from '../components/expense/ExpenseItem';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius } from '../theme/spacing';
import { FontWeight } from '../theme/typography';
import { formatCurrency, groupExpensesByDate } from '../utils/formatters';

const FILTERS = [
  { id: 'all',   label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'week',  label: 'This Week' },
  { id: 'month', label: 'This Month' },
];

const ExpenseListScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const pad = width < 380 ? 14 : 18;

  const { expenses, todayExpenses, weekExpenses, monthExpenses, deleteExpense, settings } = useExpenses();
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = useMemo(() => {
    switch (activeFilter) {
      case 'today': return todayExpenses;
      case 'week':  return weekExpenses;
      case 'month': return monthExpenses;
      default:      return expenses;
    }
  }, [activeFilter, expenses, todayExpenses, weekExpenses, monthExpenses]);

  const grouped = useMemo(() => groupExpensesByDate(filtered), [filtered]);
  const total   = filtered.reduce((s, e) => s + e.amount, 0);

  const renderGroup = useCallback(
    ({ item: group }) => (
      <View>
        <View style={s.dateRow}>
          <Text style={[s.dateLabel, { color: colors.textSecondary }]}>{group.displayDate}</Text>
          <Text style={[s.dateTotal, { color: colors.primary }]}>
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

  const labelFont = Math.min(width * 0.036, 14);

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={s.safe} edges={['top']}>
        {/* Header */}
        <View style={[s.header, { paddingHorizontal: pad }]}>
          <Text style={[s.title, { color: colors.text, fontSize: Math.min(width * 0.06, 24) }]}>Expenses</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Search')}
            style={[s.srchBtn, { backgroundColor: colors.surfaceSecondary }]}
          >
            <MaterialIcons name="search" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Filter tabs */}
        <View style={[s.filterRow, { paddingHorizontal: pad }]}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.id}
              onPress={() => setActiveFilter(f.id)}
              style={[s.filterTab, {
                backgroundColor: activeFilter === f.id ? colors.primary : colors.surfaceSecondary,
                paddingHorizontal: width < 380 ? 8 : 12,
              }]}
            >
              <Text style={[s.filterText, {
                color:      activeFilter === f.id ? '#FFFFFF' : colors.textSecondary,
                fontWeight: activeFilter === f.id ? '600' : '400',
                fontSize:   labelFont,
              }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Total bar */}
        <View style={[s.totalBar, { paddingHorizontal: pad, borderBottomColor: colors.separator, backgroundColor: colors.card }]}>
          <Text style={[s.totalLabel, { color: colors.textSecondary, fontSize: labelFont }]}>
            {filtered.length} transactions
          </Text>
          <Text style={[s.totalAmt, { color: colors.text, fontSize: labelFont }]}>
            Total: {formatCurrency(total, settings.currency)}
          </Text>
        </View>

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
            contentContainerStyle={[s.list, { paddingHorizontal: pad, paddingBottom: 100 }]}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
      <View style={[s.fab, { right: pad, bottom: 24 }]}> 
        <TouchableOpacity
          onPress={() => navigation.navigate('AddExpense', { mode: 'add' })}
          style={[s.fabBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <MaterialIcons name="add" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  title: { fontWeight: FontWeight.bold },
  srchBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  filterRow: { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  filterTab: { paddingVertical: 6, borderRadius: BorderRadius.full },
  filterText: {},
  totalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  totalLabel: {},
  totalAmt: { fontWeight: FontWeight.bold },
  list: { paddingTop: 4 },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    marginTop: 8,
  },
  fab: { position: 'absolute' },
  fabBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateLabel: { fontSize: 12, fontWeight: '600' },
  dateTotal: { fontSize: 12, fontWeight: '700' },
});

export default ExpenseListScreen;