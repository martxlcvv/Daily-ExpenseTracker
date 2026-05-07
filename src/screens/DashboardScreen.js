/**
 * DashboardScreen.js — Improved
 * Fixes: sidebar glitch (uses new Modal-based DrawerMenu), wallet edit shortcut,
 *        animated avatar with speaking bubble, smoother FAB
 */
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
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
import ExpenseItem from '../components/expense/ExpenseItem';
import UserAvatar from '../components/UserAvatar';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { getCategoryById } from '../utils/categories';
import { formatCurrency, groupExpensesByDate } from '../utils/formatters';

// ── Avatar messages cycling ───────────────────────────────────────────────────
const AVATAR_MESSAGES = [
  'Hey! Track your spending 💪',
  'Don\'t forget to log today\'s expenses!',
  'You\'re doing great, keep it up!',
  'Save a little every day 🌱',
  'Check your Analytics tab!',
];

// ── Staggered entrance wrapper ───────────────────────────────────────────────
const FadeSlide = ({ children, delay = 0, style }) => {
  const anim  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(18)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim,  { toValue: 1, duration: 380, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 340, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[{ opacity: anim, transform: [{ translateY: slide }] }, style]}>
      {children}
    </Animated.View>
  );
};

// ── Main ─────────────────────────────────────────────────────────────────────
const DashboardScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { width }          = useWindowDimensions();
  const pad = width < 380 ? 16 : 20;

  const {
    expenses, settings, todayTotal, weekTotal,
    currentBalance, toggleHideWallet, deleteExpense,
  } = useExpenses();

  const [refreshing,    setRefreshing]    = useState(false);
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [hideBalance,   setHideBalance]   = useState(settings.hideWallet || false);
  const [avatarMsg,     setAvatarMsg]     = useState('');
  const [isSpeaking,    setIsSpeaking]    = useState(false);
  const [msgIndex,      setMsgIndex]      = useState(0);

  const fabAnim  = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(1)).current;
  const scrollY  = useRef(new Animated.Value(0)).current;

  // Avatar speaking cycle — fires after mount
  useEffect(() => {
    Animated.spring(fabAnim, {
      toValue: 1, delay: 600,
      useNativeDriver: true, damping: 14, stiffness: 120,
    }).start();

    const speakCycle = () => {
      setMsgIndex((i) => {
        const next = (i + 1) % AVATAR_MESSAGES.length;
        setAvatarMsg(AVATAR_MESSAGES[next]);
        setIsSpeaking(true);
        setTimeout(() => { setIsSpeaking(false); setAvatarMsg(''); }, 3800);
        return next;
      });
    };

    // First message after 1.5s
    const t1 = setTimeout(speakCycle, 1500);
    // Then repeat every 12s
    const interval = setInterval(speakCycle, 12000);
    return () => { clearTimeout(t1); clearInterval(interval); };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }, []);

  const openDrawer  = useCallback(() => setDrawerOpen(true),  []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const toggleBalance = () => {
    setHideBalance((v) => !v);
    toggleHideWallet?.();
  };

  const fabPressIn  = () => Animated.spring(fabScale, { toValue: 0.88, useNativeDriver: true, speed: 40 }).start();
  const fabPressOut = () => Animated.spring(fabScale, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();

  const recentGroups   = groupExpensesByDate(expenses.slice(0, 20));
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, total]) => ({ ...getCategoryById(id), total }));

  const greetHour  = new Date().getHours();
  const greetLabel = greetHour < 5 ? 'Good night' : greetHour < 12 ? 'Good morning' : greetHour < 17 ? 'Good afternoon' : 'Good evening';
  const greetEmoji = greetHour < 5 ? '🌙' : greetHour < 12 ? '☀️' : greetHour < 17 ? '🌤️' : '🌙';

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50], outputRange: [0, 1], extrapolate: 'clamp',
  });

  const currency  = settings.currency  || 'PHP';
  const firstName = settings.firstName || 'User';

  const heroGradient = isDark
    ? ['#141830', '#1E2548', '#141830']
    : ['#6C63FF', '#8A7FFF', '#5A52E0'];

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      {/*
        DrawerMenu is now a Modal — renders outside this tree,
        so it NEVER causes layout resets when opened/closed.
      */}
      <DrawerMenu visible={drawerOpen} onClose={closeDrawer} navigation={navigation} />

      {/* Scroll-reveal sticky bar */}
      <Animated.View
        pointerEvents="none"
        style={[s.stickyBar, {
          opacity: headerOpacity,
          backgroundColor: colors.background,
          borderBottomColor: colors.separator,
          paddingHorizontal: pad,
        }]}
      >
        <Text style={[s.stickyTitle, { color: colors.text }]}>Dashboard</Text>
      </Animated.View>

      <SafeAreaView style={s.safe} edges={['top']}>
        <Animated.ScrollView
          contentContainerStyle={[s.scroll, { paddingHorizontal: pad }]}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* ── Top row ── */}
          <FadeSlide delay={0}>
            <View style={[s.topRow, { marginBottom: 22 }]}>
              <TouchableOpacity
                onPress={openDrawer}
                style={[s.menuBtn, { backgroundColor: colors.surfaceSecondary }]}
                activeOpacity={0.75}
              >
                <MaterialIcons name="menu" size={20} color={colors.text} />
              </TouchableOpacity>

              <View style={s.greetBlock}>
                <Text style={[s.greetSub, { color: colors.textSecondary }]}>
                  {greetLabel} {greetEmoji}
                </Text>
                <Text style={[s.greetName, { color: colors.text }]} numberOfLines={1}>
                  {firstName}
                </Text>
              </View>

              {/* Avatar — navigates to Settings on press */}
              <TouchableOpacity
                onPress={() => navigation.navigate('Settings')}
                activeOpacity={0.88}
              >
                <UserAvatar
                  size="sm"
                  message={avatarMsg}
                  showBubble={!!avatarMsg}
                  isSpeaking={isSpeaking}
                />
              </TouchableOpacity>
            </View>
          </FadeSlide>

          {/* ── Hero balance card ── */}
          <FadeSlide delay={60}>
            <LinearGradient
              colors={heroGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.heroCard}
            >
              <View style={s.orb1} />
              <View style={s.orb2} />

              <View style={s.heroBody}>
                <View style={{ flex: 1 }}>
                  <Text style={s.heroCaption}>WALLET BALANCE</Text>
                  <Text style={s.heroAmount} numberOfLines={1}>
                    {hideBalance ? '• • • • • •' : formatCurrency(currentBalance, currency)}
                  </Text>
                  <Text style={s.heroSub}>
                    {expenses.length} expense{expenses.length !== 1 ? 's' : ''} total
                  </Text>
                </View>
                <View style={s.heroRight}>
                  <TouchableOpacity onPress={toggleBalance} style={s.eyeBtn} activeOpacity={0.8}>
                    <MaterialIcons
                      name={hideBalance ? 'visibility-off' : 'visibility'}
                      size={19}
                      color="rgba(255,255,255,0.7)"
                    />
                  </TouchableOpacity>
                  {/* Wallet edit shortcut */}
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Settings')}
                    style={[s.eyeBtn, { marginTop: 6 }]}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="edit" size={17} color="rgba(255,255,255,0.55)" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Stats strip */}
              <View style={s.statsStrip}>
                {[
                  { icon: 'today',      label: 'Today',     val: hideBalance ? '••••' : formatCurrency(todayTotal, currency),  tint: '#FF6B6B' },
                  { icon: 'date-range', label: 'This Week', val: hideBalance ? '••••' : formatCurrency(weekTotal, currency),   tint: '#43D9AD' },
                  { icon: 'receipt',    label: 'Entries',   val: String(expenses.length),                                      tint: '#F7B731' },
                ].map((st, i) => (
                  <View key={st.label} style={[s.statItem, i < 2 && s.statBorder]}>
                    <View style={s.statIconRow}>
                      <MaterialIcons name={st.icon} size={11} color={st.tint} />
                      <Text style={s.statLabel}>{st.label}</Text>
                    </View>
                    <Text style={s.statVal} numberOfLines={1}>{st.val}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </FadeSlide>

          {/* ── Quick action row ── */}
          <FadeSlide delay={120}>
            <View style={[s.quickRow, { marginBottom: 26 }]}>
              {[
                { icon: 'add',        label: 'Add',       color: '#6C63FF', onPress: () => navigation.navigate('AddExpense', { mode: 'add' }) },
                { icon: 'search',     label: 'Search',    color: '#43D9AD', onPress: () => navigation.navigate('Search') },
                { icon: 'insights',   label: 'Analytics', color: '#FF8C42', onPress: () => navigation.navigate('Home', { screen: 'Analytics' }) },
                { icon: 'event-note', label: 'Planned',   color: '#F7B731', onPress: () => navigation.navigate('PlannedPayments') },
              ].map((q) => (
                <TouchableOpacity
                  key={q.label}
                  onPress={q.onPress}
                  activeOpacity={0.78}
                  style={[s.quickBtn, { backgroundColor: colors.card, borderColor: q.color + '22' }]}
                >
                  <View style={[s.quickIcon, { backgroundColor: q.color + '16' }]}>
                    <MaterialIcons name={q.icon} size={20} color={q.color} />
                  </View>
                  <Text style={[s.quickLabel, { color: colors.textSecondary }]}>{q.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </FadeSlide>

          {/* ── Top categories ── */}
          {topCategories.length > 0 && (
            <FadeSlide delay={180}>
              <View style={s.sectionRow}>
                <Text style={[s.sectionTitle, { color: colors.text }]}>Top Categories</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Home', { screen: 'Analytics' })}>
                  <Text style={[s.seeAll, { color: colors.primary }]}>See all →</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, paddingRight: 4, paddingBottom: 22 }}
                keyboardShouldPersistTaps="handled"
              >
                {topCategories.map((cat) => (
                  <View
                    key={cat.id}
                    style={[s.catCard, {
                      backgroundColor: colors.card,
                      borderColor: cat.color + '25',
                      shadowColor: cat.color,
                    }]}
                  >
                    <View style={[s.catIcon, { backgroundColor: cat.color + '18' }]}>
                      <MaterialIcons name={cat.icon} size={20} color={cat.color} />
                    </View>
                    <Text style={[s.catName, { color: colors.textSecondary }]} numberOfLines={1}>
                      {cat.name.split(' ')[0]}
                    </Text>
                    <Text style={[s.catAmt, { color: colors.text }]} numberOfLines={1}>
                      {formatCurrency(cat.total, currency)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </FadeSlide>
          )}

          {/* ── Recent expenses ── */}
          <FadeSlide delay={220}>
            <View style={s.sectionRow}>
              <Text style={[s.sectionTitle, { color: colors.text }]}>Recent</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Home', { screen: 'Expenses' })}>
                <Text style={[s.seeAll, { color: colors.primary }]}>See all →</Text>
              </TouchableOpacity>
            </View>
          </FadeSlide>

          {recentGroups.length === 0 ? (
            <EmptyState
              icon="receipt-long"
              title="No expenses yet"
              subtitle="Tap + to log your first expense"
            />
          ) : (
            recentGroups.slice(0, 3).map((group, gi) => (
              <FadeSlide key={group.date} delay={240 + gi * 50}>
                <View style={[s.groupCard, {
                  backgroundColor: colors.card,
                  borderColor: colors.separator,
                }]}>
                  <View style={[s.groupHeader, { borderBottomColor: colors.separator }]}>
                    <Text style={[s.groupDate, { color: colors.textSecondary }]}>
                      {group.displayDate.toUpperCase()}
                    </Text>
                    <Text style={[s.groupTotal, { color: colors.primary }]}>
                      {formatCurrency(group.total, currency)}
                    </Text>
                  </View>
                  {group.items.slice(0, 4).map((expense) => (
                    <ExpenseItem
                      key={expense.id}
                      expense={expense}
                      currency={currency}
                      onPress={() => navigation.navigate('AddExpense', { expense, mode: 'edit' })}
                      onDelete={deleteExpense}
                    />
                  ))}
                </View>
              </FadeSlide>
            ))
          )}

          <View style={{ height: 110 }} />
        </Animated.ScrollView>
      </SafeAreaView>

      {/* ── FAB ── */}
      <Animated.View
        style={[s.fab, {
          right: pad,
          bottom: 92,
          transform: [{ scale: Animated.multiply(fabAnim, fabScale) }],
          opacity: fabAnim,
        }]}
      >
        <TouchableOpacity
          onPressIn={fabPressIn}
          onPressOut={fabPressOut}
          onPress={() => navigation.navigate('AddExpense', { mode: 'add' })}
          activeOpacity={1}
          style={[s.fabBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
        >
          <MaterialIcons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 6, paddingBottom: 20 },

  stickyBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    paddingTop: 52, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  stickyTitle: { fontSize: 16, fontWeight: '700' },

  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuBtn: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  greetBlock: { flex: 1, paddingLeft: 2 },
  greetSub:  { fontSize: 12, fontWeight: '400', marginBottom: 1 },
  greetName: { fontSize: 21, fontWeight: '800', letterSpacing: -0.6 },

  heroCard: {
    borderRadius: 26, padding: 22, marginBottom: 16,
    overflow: 'hidden', position: 'relative',
    elevation: 10,
    shadowOffset: { width: 0, height: 10 }, shadowRadius: 28, shadowOpacity: 0.28,
  },
  orb1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, top: -70, right: -50, backgroundColor: 'rgba(255,255,255,0.07)' },
  orb2: { position: 'absolute', width: 130, height: 130, borderRadius: 65, bottom: -40, left: 10,  backgroundColor: 'rgba(255,255,255,0.04)' },
  heroBody: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 22 },
  heroRight: { alignItems: 'center' },
  heroCaption: { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: 'rgba(255,255,255,0.6)', marginBottom: 8 },
  heroAmount: { fontSize: 38, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1.5 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 5 },
  eyeBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  statsStrip: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, paddingVertical: 12 },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statBorder: { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: 'rgba(255,255,255,0.18)' },
  statIconRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },
  statVal:   { fontSize: 13, color: '#FFFFFF', fontWeight: '800', letterSpacing: -0.3 },

  quickRow: { flexDirection: 'row', gap: 10 },
  quickBtn: { flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: 18, borderWidth: 1, gap: 6, elevation: 1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, shadowOpacity: 0.06 },
  quickIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.1 },

  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.4 },
  seeAll: { fontSize: 12, fontWeight: '600' },

  catCard: { width: 112, padding: 14, borderRadius: 22, borderWidth: 1, gap: 5, elevation: 2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, shadowOpacity: 0.12 },
  catIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  catName: { fontSize: 11, fontWeight: '600', letterSpacing: 0.1 },
  catAmt:  { fontSize: 15, fontWeight: '800', letterSpacing: -0.4 },

  groupCard: { borderRadius: 20, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth },
  groupDate:  { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  groupTotal: { fontSize: 13, fontWeight: '800' },

  fab: { position: 'absolute', zIndex: 99 },
  fabBtn: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', elevation: 10, shadowOffset: { width: 0, height: 6 }, shadowRadius: 16, shadowOpacity: 0.38 },
});

export default DashboardScreen;