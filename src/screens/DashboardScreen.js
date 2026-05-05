import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/common/EmptyState';
import BalanceCard from '../components/dashboard/BalanceCard';
import SummaryCard from '../components/dashboard/SummaryCard';
import ExpenseItem from '../components/expense/ExpenseItem';
import UserAvatar from '../components/UserAvatar';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, Layout, Shadow, Spacing } from '../theme/spacing';
import { FontSize, FontWeight } from '../theme/typography';
import { getCategoryById } from '../utils/categories';
import { formatCurrency, groupExpensesByDate } from '../utils/formatters';

const DashboardScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const {
    expenses,
    settings,
    todayTotal,
    weekTotal,
    monthTotal,
    budgetUsed,
    budgetRemaining,
    deleteExpense,
    loading,
  } = useExpenses();

  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(fabAnim, {
      toValue: 1,
      delay: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  // Today's expenses sorted most recent first
  const recentGroups = groupExpensesByDate(expenses.slice(0, 20));

  // Category breakdown for today
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([id, total]) => ({ ...getCategoryById(id), total }));

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Sticky Header */}
      <Animated.View
        style={[styles.stickyHeader, { backgroundColor: colors.background, opacity: headerOpacity }]}
      >
        <Text style={[styles.stickyTitle, { color: colors.text }]}>Dashboard</Text>
      </Animated.View>

      <SafeAreaView style={styles.safe} edges={['top']}>
        <Animated.ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: false,
          })}
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {/* Greeting with Avatar */}
          <View style={styles.greetingSection}>
            <View style={styles.greetingLeft}>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>Good day,</Text>
              <Text style={[styles.greetingName, { color: colors.text }]}>
                {settings.firstName || 'User'} 👋
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={[styles.settingsBtn, { backgroundColor: colors.surfaceSecondary }]}
            >
              <MaterialIcons name="menu" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* User Avatar */}
          <View style={styles.avatarContainer}>
            <UserAvatar 
              userName={settings.firstName || 'User'} 
              mascotType={settings.mascotType || 'squirrel'}
              size="md"
              customImageUri={settings.avatarImage}
              totalExpenses={todayTotal}
              enableVoice={settings.avatarVoice || false}
            />
          </View>

          {/* Balance Card */}
          <BalanceCard
            monthTotal={monthTotal}
            budgetRemaining={budgetRemaining}
            monthlyBudget={settings.monthlyBudget || 15000}
            budgetUsed={budgetUsed}
            currency={settings.currency}
          />

          {/* Summary Cards */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
          <View style={styles.summaryRow}>
            <SummaryCard
              label="Today"
              amount={todayTotal}
              icon="today"
              color="#6C63FF"
              currency={settings.currency}
            />
            <View style={{ width: Spacing.sm }} />
            <SummaryCard
              label="This Week"
              amount={weekTotal}
              icon="date-range"
              color="#43D9AD"
              currency={settings.currency}
            />
          </View>

          {/* Top Categories */}
          {topCategories.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Categories</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Analytics')}>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScroll}
              >
                {topCategories.map((cat) => (
                  <View
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                        ...Shadow.sm,
                        shadowColor: colors.shadow,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.categoryChipIcon,
                        { backgroundColor: isDark ? cat.darkColor : cat.lightColor },
                      ]}
                    >
                      <MaterialIcons name={cat.icon} size={18} color={cat.color} />
                    </View>
                    <Text style={[styles.categoryChipName, { color: colors.textSecondary }]}>
                      {cat.name.split(' ')[0]}
                    </Text>
                    <Text style={[styles.categoryChipAmount, { color: colors.text }]}>
                      {formatCurrency(cat.total, settings.currency)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </>
          )}

          {/* Recent Transactions */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Expenses</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Expenses')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>

          {recentGroups.length === 0 ? (
            <EmptyState
              icon="receipt-long"
              title="No expenses yet"
              subtitle="Tap the + button to log your first expense"
            />
          ) : (
            recentGroups.slice(0, 3).map((group) => (
              <View key={group.date}>
                <View style={styles.dateHeader}>
                  <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
                    {group.displayDate}
                  </Text>
                  <Text style={[styles.dateTotalLabel, { color: colors.textSecondary }]}>
                    {formatCurrency(group.total, settings.currency)}
                  </Text>
                </View>
                {group.items.slice(0, 3).map((expense) => (
                  <ExpenseItem
                    key={expense.id}
                    expense={expense}
                    currency={settings.currency}
                    onPress={() =>
                      navigation.navigate('AddExpense', { expense, mode: 'edit' })
                    }
                    onDelete={deleteExpense}
                  />
                ))}
              </View>
            ))
          )}

          <View style={{ height: Layout.tabBarHeight + Spacing['2xl'] }} />
        </Animated.ScrollView>
      </SafeAreaView>

      {/* FAB */}
      <Animated.View
        style={[
          styles.fab,
          {
            transform: [
              {
                scale: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('AddExpense', { mode: 'add' })}
          style={[styles.fabBtn, { backgroundColor: colors.primary, ...Shadow.xl, shadowColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <MaterialIcons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: Layout.screenPadding },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 50,
    paddingBottom: 12,
  },
  stickyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  greetingLeft: {
    flex: 1,
  },
  greeting: { fontSize: FontSize.base, marginBottom: 2 },
  greetingName: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },
  seeAll: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
  },
  categoriesScroll: {
    paddingRight: Spacing.base,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  categoryChip: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    width: 100,
    gap: Spacing.xs,
  },
  categoryChipIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipName: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  categoryChipAmount: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  dateLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    letterSpacing: 0.2,
  },
  dateTotalLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    bottom: Layout.tabBarHeight + Spacing.base,
  },
  fabBtn: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DashboardScreen;