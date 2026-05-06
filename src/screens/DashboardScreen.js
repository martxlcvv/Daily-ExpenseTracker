import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DrawerMenu from '../components/common/DrawerMenu';
import EmptyState from '../components/common/EmptyState';
import BalanceCard from '../components/dashboard/BalanceCard';
import SummaryCard from '../components/dashboard/SummaryCard';
import ExpenseItem from '../components/expense/ExpenseItem';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, Shadow, Spacing } from '../theme/spacing';
import { getCategoryById } from '../utils/categories';
import { formatCurrency, groupExpensesByDate } from '../utils/formatters';

// Place your avatar image at assets/avatar.png
let AVATAR_SRC;
try { AVATAR_SRC = require('../../assets/avatar.png'); } catch { AVATAR_SRC = null; }

const AVATAR_NAME = 'Marty';

const DashboardScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const pad = width < 380 ? 14 : 18;

  const {
    expenses,
    settings,
    todayTotal,
    weekTotal,
    currentBalance,
    totalExpenses,
    toggleHideWallet,
    deleteExpense,
  } = useExpenses();

  const [refreshing, setRefreshing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const fabAnim  = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(fabAnim,  { toValue: 1, delay: 400, useNativeDriver: true, speed: 10 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
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

  const greetHour  = new Date().getHours();
  const greetLabel = greetHour < 12 ? 'Good morning' : greetHour < 17 ? 'Good afternoon' : 'Good evening';

  const assistantMsg = todayTotal > 0
    ? `You've spent ${formatCurrency(todayTotal, settings.currency)} today.`
    : "No expenses logged today. Stay on budget! 🎯";

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60], outputRange: [0, 1], extrapolate: 'clamp',
  });

  // Responsive sizes
  const avatarSize = Math.min(width * 0.18, 72);
  const summaryCardWidth = (width - pad * 2 - 10) / 2;

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <DrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} navigation={navigation} />

      {/* Sticky header hint */}
      <Animated.View
        style={[s.stickyHdr, { backgroundColor: colors.background, opacity: headerOpacity, paddingHorizontal: pad }]}
        pointerEvents="none"
      >
        <Text style={[s.stickyTitle, { color: colors.text }]}>Dashboard</Text>
      </Animated.View>

      <SafeAreaView style={s.safe} edges={['top']}>
        <Animated.ScrollView
          contentContainerStyle={[s.scroll, { paddingHorizontal: pad }]}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
          }
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* ── Top Row ── */}
            <View style={[s.topRow, { marginBottom: Spacing.md }]}>


              <View style={s.greetWrap}>
                <Text style={[s.greetSub, { color: colors.textSecondary, fontSize: width < 380 ? 11 : 12 }]}>{greetLabel},</Text>
                <Text style={[s.greetName, { color: colors.text, fontSize: Math.min(width * 0.052, 20) }]} numberOfLines={1}>
                  {settings.firstName || 'User'} 👋
                </Text>
              </View>
            </View>

            {/* ── Tarsi Talking Avatar Strip ── */}
            <View style={[s.tarsiStrip, {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              marginBottom: Spacing.lg,
            }]}>
              {/* Avatar image */}
              <View style={[s.tarsiImgWrap, { backgroundColor: colors.primary + '15' }]}>
                {AVATAR_SRC
                  ? <Image source={AVATAR_SRC} style={s.tarsiImg} resizeMode="cover" />
                  : <Text style={{ fontSize: 36 }}>🐿️</Text>
                }
              </View>

              {/* Speech content */}
              <View style={s.tarsiContent}>
                <Text style={[s.tarsiName, { color: colors.primary }]}>{AVATAR_NAME}</Text>
                <Text style={[s.tarsiMsg, { color: colors.text }]} numberOfLines={3}>
                  {assistantMsg}
                </Text>
              </View>
            </View>

            {/* ── Balance Card ── */}
            <BalanceCard
              walletBalance={currentBalance}
              hideBalance={settings.hideWallet || false}
              onToggleHide={toggleHideWallet}
              totalExpenses={totalExpenses}
              currency={settings.currency}
            />

            {/* ── Summary Cards ── */}
            <Text style={[s.sectionTitle, { color: colors.text, marginBottom: Spacing.sm }]}>Overview</Text>
            <View style={[s.summaryRow, { marginBottom: Spacing.xl }]}>
              <SummaryCard
                label="Today"
                amount={todayTotal}
                icon="today"
                color="#6C63FF"
                currency={settings.currency}
                style={{ width: summaryCardWidth }}
              />
              <SummaryCard
                label="This Week"
                amount={weekTotal}
                icon="date-range"
                color="#43D9AD"
                currency={settings.currency}
                style={{ width: summaryCardWidth }}
              />
            </View>

            {/* ── Top Categories ── */}
            {topCategories.length > 0 && (
              <>
                <View style={s.sectionHeader}>
                  <Text style={[s.sectionTitle, { color: colors.text }]}>Top Categories</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Home', { screen: 'Analytics' })}>
                    <Text style={[s.seeAll, { color: colors.primary }]}>See all →</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[s.catScroll, { gap: Spacing.sm }]}
                >
                  {topCategories.map((cat) => (
                    <View
                      key={cat.id}
                      style={[s.catChip, {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                        width: Math.min(width * 0.35, 140),
                        ...Shadow.sm,
                        shadowColor: colors.shadow,
                      }]}
                    >
                      <View style={[s.catChipIcon, { backgroundColor: isDark ? cat.darkColor : cat.lightColor }]}>
                        <MaterialIcons name={cat.icon} size={18} color={cat.color} />
                      </View>
                      <Text style={[s.catChipName, { color: colors.textSecondary }]} numberOfLines={1}>
                        {cat.name.split(' ')[0]}
                      </Text>
                      <Text style={[s.catChipAmt, { color: colors.text }]} numberOfLines={1}>
                        {formatCurrency(cat.total, settings.currency)}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}

            {/* ── Recent Expenses ── */}
            <View style={[s.sectionHeader, { marginTop: Spacing.lg }]}>
              <Text style={[s.sectionTitle, { color: colors.text }]}>Recent Expenses</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Home', { screen: 'Expenses' })}>
                <Text style={[s.seeAll, { color: colors.primary }]}>See all →</Text>
              </TouchableOpacity>
            </View>

            {recentGroups.length === 0 ? (
              <EmptyState
                icon="receipt-long"
                title="No expenses yet"
                subtitle="Tap + to log your first expense"
              />
            ) : (
              recentGroups.slice(0, 3).map((group) => (
                <View key={group.date}>
                  <View style={s.dateRow}>
                    <Text style={[s.dateLabel, { color: colors.textSecondary }]}>{group.displayDate}</Text>
                    <Text style={[s.dateTotal, { color: colors.textSecondary }]}>
                      {formatCurrency(group.total, settings.currency)}
                    </Text>
                  </View>
                  {group.items.slice(0, 3).map((expense) => (
                    <ExpenseItem
                      key={expense.id}
                      expense={expense}
                      currency={settings.currency}
                      onPress={() => navigation.navigate('AddExpense', { expense, mode: 'edit' })}
                      onDelete={deleteExpense}
                    />
                  ))}
                </View>
              ))
            )}

            <View style={{ height: 100 }} />
          </Animated.View>
        </Animated.ScrollView>
      </SafeAreaView>

      {/* FAB */}
      <Animated.View style={[s.fab, {
        right: pad,
        bottom: 80,
        transform: [{ scale: fabAnim }],
        opacity: fabAnim,
      }]}>
      </Animated.View>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 4, paddingBottom: 20 },
  stickyHdr: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    paddingTop: 52, paddingBottom: 10,
  },
  stickyTitle: { fontSize: 18, fontWeight: '700' },

  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  greetWrap: { flex: 1, paddingHorizontal: 4 },
  greetSub: { marginBottom: 1 },
  greetName: { fontWeight: '800', letterSpacing: -0.3 },
  avatarCircle: { borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },

  // Tarsi strip
  tarsiStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    overflow: 'hidden',
  },
  tarsiImgWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  tarsiImg: { width: 72, height: 72, borderRadius: 36 },
  tarsiContent: { flex: 1, gap: 4 },
  tarsiName: { fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },
  tarsiMsg: { fontSize: 13, fontWeight: '400', lineHeight: 18 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  seeAll: { fontSize: 12, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },

  catScroll: { paddingRight: 4, paddingBottom: Spacing.xl },
  catChip: {
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: 4,
  },
  catChipIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  catChipName: { fontSize: 12, fontWeight: '600' },
  catChipAmt: { fontSize: 14, fontWeight: '700' },

  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  dateLabel: { fontSize: 12, fontWeight: '600' },
  dateTotal: { fontSize: 12, fontWeight: '500' },

  fab: { position: 'absolute' },
  fabBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DashboardScreen;

