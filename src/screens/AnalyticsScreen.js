import { MaterialIcons } from '@expo/vector-icons';
import { format, subDays } from 'date-fns';
import { useMemo, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/common/Card';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, Layout, Spacing } from '../theme/spacing';
import { FontSize, FontWeight } from '../theme/typography';
import { getCategoryById } from '../utils/categories';
import {
  filterExpensesByDateRange,
  formatCurrency,
  getDateRanges,
  sumExpenses,
} from '../utils/formatters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - Layout.screenPadding * 2 - 32;

const RANGE_OPTIONS = [
  { id: 'week', label: '7 Days' },
  { id: 'month', label: '30 Days' },
  { id: 'all', label: 'All Time' },
];

const AnalyticsScreen = () => {
  const { colors, isDark } = useTheme();
  const { expenses, settings } = useExpenses();
  const [range, setRange] = useState('month');

  const ranges = getDateRanges();

  const filteredExpenses = useMemo(() => {
    switch (range) {
      case 'week':  return filterExpensesByDateRange(expenses, ranges.last7Days.start, ranges.last7Days.end);
      case 'month': return filterExpensesByDateRange(expenses, ranges.last30Days.start, ranges.last30Days.end);
      default:      return expenses;
    }
  }, [range, expenses]);

  const totalSpend = sumExpenses(filteredExpenses);

  // Category breakdown for pie
  const categoryTotals = useMemo(() => {
    const totals = {};
    filteredExpenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .map(([id, amount]) => {
        const cat = getCategoryById(id);
        return { id, name: cat.name.split(' ')[0], amount, color: cat.color, pct: totalSpend > 0 ? (amount / totalSpend) * 100 : 0 };
      });
  }, [filteredExpenses, totalSpend]);

  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState({ labels: [], datasets: [{ data: [] }] });

  useEffect(() => {
    const newPieData = categoryTotals.slice(0, 6).map((c) => ({
      name: c.name,
      population: c.amount,
      color: c.color,
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    }));

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      const key = format(d, 'yyyy-MM-dd');
      const label = format(d, 'EEE');
      const dayExpenses = filteredExpenses.filter((e) => e.date.startsWith(key));
      return { label, total: sumExpenses(dayExpenses) };
    });

    const newBarData = {
      labels: days.map((d) => d.label),
      datasets: [{ data: days.map((d) => d.total || 0) }],
    };

    setPieData(newPieData);
    setBarData(newBarData);
  }, [categoryTotals, filteredExpenses, colors.textSecondary]);

  const chartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
    labelColor: () => colors.textSecondary,
    strokeWidth: 2,
    barPercentage: 0.6,
    decimalPlaces: 0,
    propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary },
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
          </View>

          {/* Range Tabs */}
          <View style={styles.rangeRow}>
            {RANGE_OPTIONS.map((r) => (
              <TouchableOpacity
                key={r.id}
                onPress={() => setRange(r.id)}
                style={[
                  styles.rangeTab,
                  {
                    backgroundColor: range === r.id ? colors.primary : colors.surfaceSecondary,
                    flex: 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.rangeText,
                    { color: range === r.id ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Total Overview */}
          <Card style={styles.totalCard} elevation="md">
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
              Total Spent ({RANGE_OPTIONS.find((r) => r.id === range)?.label})
            </Text>
            <Text style={[styles.totalAmount, { color: colors.text }]}>
              {formatCurrency(totalSpend, settings.currency)}
            </Text>
            <Text style={[styles.totalCount, { color: colors.textSecondary }]}>
              {filteredExpenses.length} transactions
            </Text>
          </Card>

          {/* Bar Chart */}
          {filteredExpenses.length > 0 && (
            <Card style={styles.chartCard} elevation="sm">
              <Text style={[styles.chartTitle, { color: colors.text }]}>Daily Spending (7 Days)</Text>
              <BarChart
                key={`bar-${range}-${barData.datasets[0]?.data.join('-')}`}
                data={barData}
                width={CHART_WIDTH}
                height={180}
                chartConfig={chartConfig}
                style={styles.chart}
                fromZero
                showValuesOnTopOfBars={false}
                withInnerLines={false}
              />
            </Card>
          )}

          {/* Pie Chart */}
          {pieData.length > 0 && (
            <Card style={styles.chartCard} elevation="sm">
              <Text style={[styles.chartTitle, { color: colors.text }]}>Spending by Category</Text>
              <PieChart
                key={`pie-${range}-${pieData.map((p) => p.population).join('-')}`}
                data={pieData}
                width={CHART_WIDTH}
                height={200}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="8"
                style={styles.chart}
                hasLegend={false}
              />
              {/* Custom Legend */}
              <View style={styles.legend}>
                {categoryTotals.slice(0, 6).map((cat) => (
                  <View key={cat.id} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                    <Text style={[styles.legendName, { color: colors.textSecondary }]} numberOfLines={1}>
                      {cat.name}
                    </Text>
                    <Text style={[styles.legendPct, { color: colors.text }]}>
                      {cat.pct.toFixed(1)}%
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {/* Category Breakdown List */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Category Breakdown</Text>
          {categoryTotals.map((cat, idx) => (
            <Card key={cat.id} style={styles.catRow} elevation="sm">
              <View
                style={[
                  styles.catIconWrap,
                  { backgroundColor: getCategoryById(cat.id).lightColor },
                ]}
              >
                <MaterialIcons
                  name={getCategoryById(cat.id).icon}
                  size={20}
                  color={cat.color}
                />
              </View>
              <View style={styles.catInfo}>
                <Text style={[styles.catName, { color: colors.text }]}>{cat.name}</Text>
                <View style={[styles.catBar, { backgroundColor: colors.surfaceSecondary }]}>
                  <View
                    style={[
                      styles.catBarFill,
                      { backgroundColor: cat.color, width: `${Math.min(cat.pct, 100)}%` },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.catAmountWrap}>
                <Text style={[styles.catAmount, { color: colors.text }]}>
                  {formatCurrency(cat.amount, settings.currency)}
                </Text>
                <Text style={[styles.catPct, { color: colors.textSecondary }]}>
                  {cat.pct.toFixed(1)}%
                </Text>
              </View>
            </Card>
          ))}

          <View style={{ height: Layout.tabBarHeight + Spacing.xl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: Layout.screenPadding },
  header: { marginBottom: Spacing.base },
  title: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold },
  rangeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  rangeTab: {
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  rangeText: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold },
  totalCard: {
    alignItems: 'center',
    marginBottom: Spacing.base,
    paddingVertical: Spacing.xl,
  },
  totalLabel: { fontSize: FontSize.sm, marginBottom: Spacing.xs, letterSpacing: 0.3 },
  totalAmount: { fontSize: FontSize['4xl'], fontWeight: FontWeight.extraBold, letterSpacing: -1 },
  totalCount: { fontSize: FontSize.sm, marginTop: Spacing.xs },
  chartCard: { marginBottom: Spacing.base, overflow: 'hidden' },
  chartTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    marginBottom: Spacing.md,
  },
  chart: { borderRadius: BorderRadius.md },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minWidth: '45%',
  },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendName: { flex: 1, fontSize: FontSize.xs },
  legendPct: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  catIconWrap: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catInfo: { flex: 1, gap: Spacing.xs },
  catName: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold },
  catBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 2 },
  catAmountWrap: { alignItems: 'flex-end' },
  catAmount: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  catPct: { fontSize: FontSize.xs },
});

export default AnalyticsScreen;