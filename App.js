import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ExpenseProvider, useExpenses } from './src/context/ExpenseContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

// ── Splash screen ─────────────────────────────────────────────────────────────
function SplashView({ onDone }) {
  const { isDark } = useTheme();
  const fade  = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.88)).current;
  const spin  = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();

  const logoSize = Math.min(width * 0.22, 96);
  const titleSize = Math.min(width * 0.075, 30);

  useEffect(() => {
    spin.setValue(0);
    fade.setValue(0);

    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, speed: 16, bounciness: 4, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { iterations: -1 }
    ).start();

    const t = setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: 350, useNativeDriver: true })
        .start(() => onDone());
    }, 2500);

    return () => {
      clearTimeout(t);
      spin.stopAnimation();
    };
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={[s.splash, { backgroundColor: isDark ? '#0F1419' : '#1A0533' }]}>
      <Animated.View style={[s.splashContent, { opacity: fade, transform: [{ scale }] }]}>
        <View style={[s.logoCircle, { width: logoSize, height: logoSize, borderRadius: logoSize / 2 }]}>
          <Text style={{ fontSize: logoSize * 0.52 }}>💰</Text>
        </View>
        <Text style={[s.splashTitle, { fontSize: titleSize }]}>Daily Ledger</Text>
        <Text style={s.splashSub}>Track your expenses, reach your goals</Text>
        <Animated.View style={[s.spinner, { transform: [{ rotate }] }]} />
        <Text style={s.splashVersion}>v1.0.0</Text>
      </Animated.View>
    </View>
  );
}

// ── Loading overlay ────────────────────────────────────────────────────────────
function LoadingView() {
  const { colors } = useTheme();
  const fade = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    spin.setValue(0);
    fade.setValue(0);

    Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 950,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { iterations: -1 }
    ).start();

    return () => spin.stopAnimation();
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={[s.loading, { backgroundColor: colors.background }]}>
      <Animated.View style={[s.loadingInner, { opacity: fade }]}>
        <Text style={{ fontSize: 44, marginBottom: 20 }}>💰</Text>
        <Animated.View
          style={[s.spinner, {
            borderColor: colors.primary + '30',
            borderTopColor: colors.primary,
            transform: [{ rotate }],
          }]}
        />
        <Text style={[s.loadingMsg, { color: colors.textSecondary }]}>
          Loading your expenses…
        </Text>
      </Animated.View>
    </View>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
function AppContent() {
  const { loading } = useExpenses();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) return <SplashView onDone={() => setShowSplash(false)} />;
  if (loading)    return <LoadingView />;
  return <AppNavigator />;
}

export default function App() {
  return (
    <ThemeProvider>
      <ExpenseProvider>
        <AppContent />
      </ExpenseProvider>
    </ThemeProvider>
  );
}

const s = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  splashContent: { alignItems: 'center', gap: 10 },
  logoCircle: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  splashTitle: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  splashSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 220,
    lineHeight: 18,
  },
  splashVersion: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 4,
  },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingInner: { alignItems: 'center', gap: 12 },
  loadingMsg: { fontSize: 14, fontWeight: '500', textAlign: 'center', marginTop: 4 },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: '#FFFFFF',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    marginVertical: 14,
  },
});