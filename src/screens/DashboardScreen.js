import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DrawerMenu from '../components/common/DrawerMenu';
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
    totalExpenses,
    toggleHideWallet,
    deleteExpense,
  } = useExpenses();

  const [refreshing, setRefreshing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(fabAnim, { toValue: 1, delay: 500, useNativeDriver: true, speed: 8 }),
      Animated.timing(headerFadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const recentGroups = groupExpensesByDate(expenses.slice(0, 20));

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

  const greetHour = new Date().getHours();
  const greetLabel =
    greetHour < 12 ? 'Good morning' :
    greetHour < 17 ? 'Good afternoon' :
                     'Good evening';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Drawer menu — rendered above everything */}
      <DrawerMenu
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigation={navigation}
      />

      {/* Compact sticky header (fades in on scroll) */}
      <Animated.View
        style={[
          styles.stickyHeader,
          { backgroundColor: colors.background, opacity: headerOpacity },
        ]}
        pointerEvents="none"
      >
        <Text style={[styles.stickyTitle, { color: colors.text }]}>Dashboard</Text>
      </Animated.View>

      <SafeAreaView style={styles.safe} edges={['top']}>
        <Animated.ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          <Animated.View style={{ opacity: headerFadeAnim }}>
            {/* ── Top row: greeting + avatar + menu button ── */}
            <View style={styles.topRow}>
              <TouchableOpacity
                onPress={() => setDrawerOpen(true)}
                style={[styles.menuBtn, { backgroundColor: colors.surfaceSecondary }]}
                activeOpacity={0.7}
              >
                <MaterialIcons name="menu" size={22} color={colors.primary} />
              </TouchableOpacity>

              <View style={styles.greetingCenter}>
                <Text style={[styles.greetLabel, { color: colors.textSecondary }]}>
                  {greetLabel},
                </Text>
                <Text style={[styles.greetName, { color: colors.text }]} numberOfLines={1}>
                  {settings.firstName || 'User'} 👋
                </Text>
              </View>

              {/* Avatar sits in the top-right corner */}
              <TouchableOpacity
                onPress={() => navigation.navigate('Settings')}
                activeOpacity={0.85}
              >
                <UserAvatar
                  userName={settings.firstName || 'User'}
                  mascotType={settings.mascotType || 'squirrel'}
                  size="sm"
                  customImageUri={settings.avatarImage || null}
                  totalExpenses={todayTotal}
                  enableVoice={false}
                />
              </TouchableOpacity>
            </View>

            {/* Speech bubble / assistant message strip */}
            <View
              style={[styles.assistantStrip, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '30' }]}
            >
              <Text style={{ fontSize: 20 }}>
                {settings.mascotType === 'rocket' ? '🚀' :
                 settings.mascotType === 'star'   ? '⭐' :
                 settings.mascotType === 'heart'  ? '💖' :
                 settings.mascotType === 'smile'  ? '😊' : '🐿️'}
              </Text>
              <Text style={[styles.assistantMsg, { color: colors.primary }]}>
                {todayTotal > 0
                  ? `You've spent ${formatCurrency(todayTotal, settings.currency)} today.`
                  : "No expenses logged today. Stay on budget! 🎯"}
              </Text>
            </View>

            {/* Balance Card */}
            <BalanceCard
              walletBalance={settings.walletBalance || 0}
              hideBalance={settings.hideWallet || false}
              onToggleHide={toggleHideWallet}
              totalExpenses={totalExpenses}
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
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Top Categories
                  </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Home', { screen: 'Analytics' })}>
                    <Text style={[styles.seeAll, { color: colors.primary }]}>See all →</Text>
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
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Recent Expenses
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Home', { screen: 'Expenses' })}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all →</Text>
              </TouchableOpacity>
            </View>

            {recentGroups.length === 0 ? (
              <EmptyState
                icon="receipt-long"
                title="No expenses yet"
                subtitle='Tap the + button to log your first expense'
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
          </Animated.View>
        </Animated.ScrollView>
      </SafeAreaView>

      {/* FAB */}
      <Animated.View
        style={[
          styles.fab,
          {
            transform: [
              {
                scale: fabAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ],
            opacity: fabAnim,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('AddExpense', { mode: 'add' })}
          style={[
            styles.fabBtn,
            { backgroundColor: colors.primary, ...Shadow.xl, shadowColor: colors.primary },
          ]}
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

  // Top row
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingCenter: { flex: 1, paddingHorizontal: Spacing.sm },
  greetLabel: { fontSize: FontSize.sm, marginBottom: 2 },
  greetName: { fontSize: FontSize.xl, fontWeight: FontWeight.extraBold, letterSpacing: -0.5 },

  // Assistant strip
  assistantStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  assistantMsg: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 18,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
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
    marginBottom: Spacing['2xl'],
  },
  categoriesScroll: {
    paddingRight: Spacing.base,
    marginBottom: Spacing['2xl'],
    gap: Spacing.md,
  },
  categoryChip: {
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    minWidth: 130,
    gap: Spacing.xs,
  },
  categoryChipIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  categoryChipName: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold },
  categoryChipAmount: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  dateLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, letterSpacing: 0.2 },
  dateTotalLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
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
