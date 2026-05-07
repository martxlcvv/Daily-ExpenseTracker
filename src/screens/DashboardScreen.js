/**
 * DashboardScreen.js — Redesigned
 * Features: Tagalog Gen-Z avatar, budget meter, animated stats,
 *           glassmorphism cards, staggered entrance, drawer fixed
 */
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
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

// ── Tagalog Gen-Z Avatar Messages ────────────────────────────────────────────
const AVATAR_MESSAGES = [
  'Uy, huwag kalimutang mag-log ng gastos! 💀',
  'Bestie, updated ka na ba sa budget mo? No cap 📊',
  'Sana all may savings, ikaw na maging una! 🔥',
  'Grabe, ang ganda ng swag mo pero kumusta wallet? 😭',
  'Pag nag-ipon ka ngayon, flex mo bukas! 💪',
  'Tara analytics check, seryoso 'to ha? 👀',
  'Alam mo ba, ang pera na hindi sinusubaybayan ay pera na nawawala! 🤑',
  'Lowkey proud sa 'yo pag nag-budget ka, ikaw? 🫶',
  'Basta laban lang sa expenses, kaya natin 'to! ✨',
  'Huwag impulse buy today, mag-invest na tayo! 🚀',
];

// ── Staggered entrance wrapper ───────────────────────────────────────────────
const FadeSlide = ({ children, delay = 0, style }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(22)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration: 420, delay,
        easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0, duration: 380, delay,
        easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
};

// ── Budget Progress Bar ───────────────────────────────────────────────────────
const BudgetMeter = ({ spent, budget, currency }) => {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;
  const pct  = budget > 0 ? Math.min(spent / budget, 1) : 0;

  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 1000, delay: 400, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [pct]);

  const barColor = pct > 0.85 ? '#FF5252' : pct > 0.6 ? '#FFB347' : '#43D9AD';
  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={bm.wrap}>
      <View style={bm.row}>
        <Text style={[bm.label, { color: colors.textSecondary }]}>Monthly Budget</Text>
        <Text style={[bm.pctText, { color: barColor }]}>{Math.round(pct * 100)}% used</Text>
      </View>
      <View style={[bm.track, { backgroundColor: colors.surfaceSecondary }]}>
        <Animated.View style={[bm.fill, { width, backgroundColor: barColor }]} />
      </View>
      <View style={bm.row}>
        <Text style={[bm.sub, { color: colors.textTertiary }]}>
          {formatCurrency(spent, currency)} spent
        </Text>
        <Text style={[bm.sub, { color: colors.textTertiary }]}>
          of {formatCurrency(budget, currency)}
        </Text>
      </View>
    </View>
  );
};

const bm = StyleSheet.create({
  wrap: { marginTop: 14, gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  pctText: { fontSize: 11, fontWeight: '700' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  sub: { fontSize: 10 },
});

// ── Quick Stats Row ───────────────────────────────────────────────────────────
const StatPill = ({ label, value, icon, color, delay }) => {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(0.8)).current;
  const fade  = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, delay, damping: 14, stiffness: 150, useNativeDriver: true }),
      Animated.timing(fade,  { toValue: 1, duration: 350, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ opacity: fade, transform: [{ scale }], flex: 1 }}>
      <View style={[sp.card, { backgroundColor: colors.card, borderColor: color + '25' }]}>
        <View style={[sp.icon, { backgroundColor: color + '18' }]}>
          <MaterialIcons name={icon} size={16} color={color} />
        </View>
        <Text style={[sp.val, { color: colors.text }]} numberOfLines={1}>{value}</Text>
        <Text style={[sp.label, { color: colors.textTertiary }]}>{label}</Text>
      </View>
    </Animated.View>
  );
};

const sp = StyleSheet.create({
  card: { borderRadius: 16, padding: 12, borderWidth: 1, gap: 4, alignItems: 'flex-start' },
  icon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  val: { fontSize: 14, fontWeight: '800', letterSpacing: -0.3 },
  label: { fontSize: 10, fontWeight: '600', letterSpacing: 0.2 },
});

// ── Main Component ────────────────────────────────────────────────────────────
const DashboardScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const pad = width < 380 ? 16 : 20;

  const {
    expenses, settings, todayTotal, weekTotal, monthTotal,
    currentBalance, toggleHideWallet, deleteExpense,
  } = useExpenses();

  const [refreshing,  setRefreshing]  = useState(false);
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [hideBalance, setHideBalance] = useState(settings.hideWallet || false);
  const [avatarMsg,   setAvatarMsg]   = useState('');
  const [isSpeaking,  setIsSpeaking]  = useState(false);
  const [msgIdx,      setMsgIdx]      = useState(0);

  const fabAnim  = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(1)).current;
  const scrollY  = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // FAB entrance + pulse
  useEffect(() => {
    Animated.spring(fabAnim, { toValue: 1, delay: 700, useNativeDriver: true, damping: 12, stiffness: 110 }).start();

    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.06, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
  }, []);

  // Avatar speaking cycle with Tagalog Gen-Z messages
  useEffect(() => {
    const speak = () => {
      setMsgIdx((i) => {
        const next = (i + 1) % AVATAR_MESSAGES.length;
        setAvatarMsg(AVATAR_MESSAGES[next]);
        setIsSpeaking(true);
        setTimeout(() => { setIsSpeaking(false); setAvatarMsg(''); }, 4000);
        return next;
      });
    };
    const t1 = setTimeout(speak, 1800);
    const interval = setInterval(speak, 13000);
    return () => { clearTimeout(t1); clearInterval(interval); };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const toggleBalance = useCallback(() => {
    setHideBalance((v) => !v);
    toggleHideWallet?.();
  }, [toggleHideWallet]);

  const fabPressIn  = () => Animated.spring(fabScale, { toValue: 0.87, useNativeDriver: true, speed: 40 }).start();
  const fabPressOut = () => Animated.spring(fabScale, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();

  // Derived data
  const recentGroups = useMemo(() => groupExpensesByDate(expenses.slice(0, 25)), [expenses]);
  const topCategories = useMemo(() => {
    const totals = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});
    return Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, total]) => ({ ...getCategoryById(id), total }));
  }, [expenses]);

  const h = new Date().getHours();
  const greetLabel = h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const greetEmoji = h < 5 ? '🌙' : h < 12 ? '🌅' : h < 17 ? '☀️' : '🌙';

  const currency  = settings.currency  || 'PHP';
  const firstName = settings.firstName || 'Bestie';
  const budget    = settings.monthlyBudget || 15000;

  const scrollHeaderOpacity = scrollY.interpolate({ inputRange: [0, 60], outputRange: [0, 1], extrapolate: 'clamp' });

  const heroColors = isDark
    ? ['#1A1040', '#2D1B69', '#1A1040']
    : ['#6B46C1', '#8B5CF6', '#6B46C1'];

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <DrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} navigation={navigation} />

      {/* Scroll-reveal sticky header */}
      <Animated.View pointerEvents="none" style={[s.stickyBar, {
        opacity: scrollHeaderOpacity,
        backgroundColor: colors.background + 'EE',
        borderBottomColor: colors.separator,
        paddingHorizontal: pad,
      }]}>
        <Text style={[s.stickyTitle, { color: colors.text }]}>Dashboard 💰</Text>
      </Animated.View>

      <SafeAreaView style={s.safe} edges={['top']}>
        <Animated.ScrollView
          contentContainerStyle={[s.scroll, { paddingHorizontal: pad }]}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing} onRefresh={onRefresh}
              tintColor={colors.primary} colors={[colors.primary]}
            />
          }
        >
          {/* ── Top row ──────────────────────────────────────── */}
          <FadeSlide delay={0}>
            <View style={[s.topRow, { marginBottom: 20 }]}>
              <TouchableOpacity
                onPress={() => setDrawerOpen(true)}
                style={[s.menuBtn, { backgroundColor: colors.surfaceSecondary }]}
                activeOpacity={0.75}
              >
                <MaterialIcons name="menu" size={21} color={colors.text} />
              </TouchableOpacity>

              <View style={s.greetBlock}>
                <Text style={[s.greetSub, { color: colors.textSecondary }]}>{greetLabel} {greetEmoji}</Text>
                <Text style={[s.greetName, { color: colors.text }]} numberOfLines={1}>
                  {firstName}! 👋
                </Text>
              </View>

              <TouchableOpacity onPress={() => navigation.navigate('Settings')} activeOpacity={0.85}>
                <UserAvatar
                  size="sm"
                  message={avatarMsg}
                  showBubble={!!avatarMsg}
                  isSpeaking={isSpeaking}
                />
              </TouchableOpacity>
            </View>
          </FadeSlide>

          {/* ── Hero Balance Card ─────────────────────────── */}
          <FadeSlide delay={60}>
            <LinearGradient colors={heroColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.heroCard}>
              {/* Decorative orbs */}
              <View style={s.orb1} /><View style={s.orb2} /><View style={s.orb3} />

              <View style={s.heroTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.heroCaption}>💳  WALLET BALANCE</Text>
                  <Text style={s.heroAmount} numberOfLines={1} adjustsFontSizeToFit>
                    {hideBalance ? '•  •  •  •  •  •' : formatCurrency(currentBalance, currency)}
                  </Text>
                  <Text style={s.heroSub}>
                    {expenses.length} expense{expenses.length !== 1 ? 's' : ''} recorded
                  </Text>
                </View>
                <View style={s.heroActions}>
                  <TouchableOpacity onPress={toggleBalance} style={s.heroBtn} activeOpacity={0.8}>
                    <MaterialIcons
                      name={hideBalance ? 'visibility-off' : 'visibility'}
                      size={18} color="rgba(255,255,255,0.75)"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={[s.heroBtn, { marginTop: 6 }]} activeOpacity={0.8}>
                    <MaterialIcons name="edit" size={16} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Stats strip */}
              <View style={s.statsStrip}>
                {[
                  { icon: 'today',      label: 'Today',      val: formatCurrency(todayTotal, currency),  tint: '#FF6B6B' },
                  { icon: 'date-range', label: 'This Week',  val: formatCurrency(weekTotal, currency),   tint: '#43D9AD' },
                  { icon: 'calendar-month', label: 'Month',  val: formatCurrency(monthTotal, currency),  tint: '#FFB347' },
                ].map((st, i) => (
                  <View key={st.label} style={[s.statItem, i < 2 && s.statBorder]}>
                    <View style={s.statIconRow}>
                      <MaterialIcons name={st.icon} size={10} color={st.tint} />
                      <Text style={s.statLabel}>{st.label}</Text>
                    </View>
                    <Text style={s.statVal} numberOfLines={1}>
                      {hideBalance ? '••••' : st.val}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Budget meter */}
              <BudgetMeter spent={monthTotal} budget={budget} currency={currency} />
            </LinearGradient>
          </FadeSlide>

          {/* ── Quick Stats Pills ──────────────────────────── */}
          <FadeSlide delay={120}>
            <View style={[s.statPillsRow, { marginBottom: 22 }]}>
              <StatPill label="Entries" value={String(expenses.length)} icon="receipt-long" color="#6C63FF" delay={0} />
              <StatPill label="Categories" value={String(new Set(expenses.map(e => e.category)).size)} icon="category" color="#43D9AD" delay={60} />
              <StatPill label="This Week" value={String(expenses.filter(e => {
                const d = new Date(e.date);
                const now = new Date();
                const diff = (now - d) / (1000 * 60 * 60 * 24);
                return diff <= 7;
              }).length)} icon="trending-up" color="#FFB347" delay={120} />
            </View>
          </FadeSlide>

          {/* ── Quick Actions ──────────────────────────────── */}
          <FadeSlide delay={180}>
            <View style={[s.quickRow, { marginBottom: 26 }]}>
              {[
                { icon: 'add-circle',  label: 'Add',       color: '#6C63FF', onPress: () => navigation.navigate('AddExpense', { mode: 'add' }) },
                { icon: 'search',      label: 'Search',    color: '#43D9AD', onPress: () => navigation.navigate('Search') },
                { icon: 'insights',    label: 'Analytics', color: '#FF8C42', onPress: () => navigation.navigate('Home', { screen: 'Analytics' }) },
                { icon: 'shopping-cart', label: 'Shopping', color: '#F7B731', onPress: () => navigation.navigate('ShoppingList') },
              ].map((q) => (
                <TouchableOpacity
                  key={q.label}
                  onPress={q.onPress}
                  activeOpacity={0.78}
                  style={[s.quickBtn, { backgroundColor: colors.card, borderColor: q.color + '30' }]}
                >
                  <View style={[s.quickIcon, { backgroundColor: q.color + '18' }]}>
                    <MaterialIcons name={q.icon} size={22} color={q.color} />
                  </View>
                  <Text style={[s.quickLabel, { color: colors.textSecondary }]}>{q.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </FadeSlide>

          {/* ── Top Categories ─────────────────────────────── */}
          {topCategories.length > 0 && (
            <FadeSlide delay={220}>
              <View style={s.sectionRow}>
                <Text style={[s.sectionTitle, { color: colors.text }]}>🏆 Top Gastos</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Home', { screen: 'Analytics' })}>
                  <Text style={[s.seeAll, { color: colors.primary }]}>Tingnan lahat →</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, paddingRight: 4, paddingBottom: 24 }}
                keyboardShouldPersistTaps="handled"
              >
                {topCategories.map((cat, i) => (
                  <FadeSlide key={cat.id} delay={240 + i * 40}>
                    <View style={[s.catCard, { backgroundColor: colors.card, borderColor: cat.color + '28', shadowColor: cat.color }]}>
                      <View style={[s.catIcon, { backgroundColor: cat.color + '20' }]}>
                        <MaterialIcons name={cat.icon} size={20} color={cat.color} />
                      </View>
                      <Text style={[s.catName, { color: colors.textSecondary }]} numberOfLines={1}>
                        {cat.name.split(' ')[0]}
                      </Text>
                      <Text style={[s.catAmt, { color: colors.text }]} numberOfLines={1}>
                        {formatCurrency(cat.total, currency)}
                      </Text>
                      {/* mini bar */}
                      <View style={[s.catMiniBar, { backgroundColor: cat.color + '18' }]}>
                        <View style={[s.catMiniBarFill, { backgroundColor: cat.color, width: '70%' }]} />
                      </View>
                    </View>
                  </FadeSlide>
                ))}
              </ScrollView>
            </FadeSlide>
          )}

          {/* ── Recent Expenses ────────────────────────────── */}
          <FadeSlide delay={260}>
            <View style={s.sectionRow}>
              <Text style={[s.sectionTitle, { color: colors.text }]}>🕒 Recent</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Home', { screen: 'Expenses' })}>
                <Text style={[s.seeAll, { color: colors.primary }]}>Lahat →</Text>
              </TouchableOpacity>
            </View>
          </FadeSlide>

          {recentGroups.length === 0 ? (
            <EmptyState
              icon="receipt-long"
              title="Wala pang gastos! 🎉"
              subtitle="I-tap ang + para mag-add ng expense"
            />
          ) : (
            recentGroups.slice(0, 3).map((group, gi) => (
              <FadeSlide key={group.date} delay={280 + gi * 55}>
                <View style={[s.groupCard, { backgroundColor: colors.card, borderColor: colors.separator }]}>
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

          {/* Planned payments reminder */}
          {(settings.plannedPayments || []).length > 0 && (
            <FadeSlide delay={360}>
              <TouchableOpacity
                onPress={() => navigation.navigate('PlannedPayments')}
                activeOpacity={0.85}
                style={[s.reminderCard, { backgroundColor: colors.card, borderColor: '#F7B731' + '40' }]}
              >
                <View style={[s.reminderIcon, { backgroundColor: '#F7B73120' }]}>
                  <MaterialIcons name="event-note" size={20} color="#F7B731" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.reminderTitle, { color: colors.text }]}>May Planned Payments! 📅</Text>
                  <Text style={[s.reminderSub, { color: colors.textSecondary }]}>
                    {settings.plannedPayments.length} upcoming payment{settings.plannedPayments.length !== 1 ? 's' : ''} · I-check mo na!
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            </FadeSlide>
          )}

          <View style={{ height: 120 }} />
        </Animated.ScrollView>
      </SafeAreaView>

      {/* ── FAB ─────────────────────────────────────────────── */}
      <Animated.View style={[s.fab, {
        right: pad, bottom: 92,
        transform: [
          { scale: Animated.multiply(fabAnim, fabScale) },
          { scale: pulseAnim },
        ],
        opacity: fabAnim,
      }]}>
        <TouchableOpacity
          onPressIn={fabPressIn}
          onPressOut={fabPressOut}
          onPress={() => navigation.navigate('AddExpense', { mode: 'add' })}
          activeOpacity={1}
          style={[s.fabBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
        >
          <MaterialIcons name="add" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        {/* Ripple ring */}
        <Animated.View style={[s.fabRipple, {
          borderColor: colors.primary + '40',
          transform: [{ scale: pulseAnim }],
        }]} />
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
    paddingTop: 54, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  stickyTitle: { fontSize: 16, fontWeight: '700' },

  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuBtn: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  greetBlock: { flex: 1, paddingLeft: 2 },
  greetSub:  { fontSize: 12, fontWeight: '400', marginBottom: 1 },
  greetName: { fontSize: 22, fontWeight: '800', letterSpacing: -0.7 },

  // Hero card
  heroCard: {
    borderRadius: 28, padding: 22, marginBottom: 16,
    overflow: 'hidden', elevation: 12,
    shadowOffset: { width: 0, height: 12 }, shadowRadius: 30, shadowOpacity: 0.3,
  },
  orb1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, top: -80, right: -50, backgroundColor: 'rgba(255,255,255,0.06)' },
  orb2: { position: 'absolute', width: 140, height: 140, borderRadius: 70, bottom: -40, left: 10, backgroundColor: 'rgba(255,255,255,0.04)' },
  orb3: { position: 'absolute', width: 70, height: 70, borderRadius: 35, top: 20, right: 100, backgroundColor: 'rgba(255,255,255,0.03)' },

  heroTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  heroActions: { alignItems: 'center' },
  heroCaption: { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: 'rgba(255,255,255,0.55)', marginBottom: 8 },
  heroAmount: { fontSize: 36, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1.5, marginBottom: 4 },
  heroSub: { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  heroBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.13)', alignItems: 'center', justifyContent: 'center' },

  statsStrip: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.22)', borderRadius: 18, paddingVertical: 13 },
  statItem: { flex: 1, alignItems: 'center', gap: 5 },
  statBorder: { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: 'rgba(255,255,255,0.15)' },
  statIconRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statLabel: { fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: '600', letterSpacing: 0.3 },
  statVal: { fontSize: 13, color: '#FFFFFF', fontWeight: '800', letterSpacing: -0.3 },

  // Stat pills
  statPillsRow: { flexDirection: 'row', gap: 10 },

  // Quick actions
  quickRow: { flexDirection: 'row', gap: 10 },
  quickBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 20, borderWidth: 1, gap: 7, elevation: 1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, shadowOpacity: 0.07 },
  quickIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2 },

  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.4 },
  seeAll: { fontSize: 12, fontWeight: '700' },

  // Category cards
  catCard: { width: 118, padding: 14, borderRadius: 22, borderWidth: 1, gap: 5, elevation: 3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, shadowOpacity: 0.14 },
  catIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  catName: { fontSize: 11, fontWeight: '600', letterSpacing: 0.1 },
  catAmt:  { fontSize: 15, fontWeight: '800', letterSpacing: -0.4 },
  catMiniBar: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 4 },
  catMiniBarFill: { height: '100%', borderRadius: 2 },

  // Expense groups
  groupCard: { borderRadius: 22, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  groupDate:  { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  groupTotal: { fontSize: 13, fontWeight: '800' },

  // Reminder card
  reminderCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 18, borderWidth: 1, marginBottom: 14, gap: 12, elevation: 1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, shadowOpacity: 0.06 },
  reminderIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  reminderTitle: { fontSize: 13, fontWeight: '700' },
  reminderSub: { fontSize: 11, marginTop: 2 },

  // FAB
  fab: { position: 'absolute', zIndex: 99 },
  fabBtn: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', elevation: 12, shadowOffset: { width: 0, height: 8 }, shadowRadius: 20, shadowOpacity: 0.45 },
  fabRipple: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 2, top: -9, left: -9 },
});

export default DashboardScreen;