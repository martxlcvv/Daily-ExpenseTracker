import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { ExpenseProvider, useExpenses } from './src/context/ExpenseContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

// ── Splash screen (shown for 2.5 s on first launch) ─────────────────────────
function SplashView({ onDone }) {
  const { colors, isDark } = useTheme();
  const fade  = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const spin  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Appear
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, speed: 14, useNativeDriver: true }),
    ]).start();

    // Spinner
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1200, useNativeDriver: true })
    ).start();

    // Auto-dismiss
    const t = setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: 400, useNativeDriver: true }).start(() =>
        onDone()
      );
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={[s.splash, { backgroundColor: isDark ? '#0A0A14' : '#6C63FF' }]}>
      <Animated.View style={[s.splashContent, { opacity: fade, transform: [{ scale }] }]}>
        <View style={s.logoCircle}>
          <Text style={s.logoEmoji}>💰</Text>
        </View>
        <Text style={s.splashTitle}>Daily Ledger</Text>
        <Text style={s.splashSub}>Track your expenses, reach your goals</Text>

        <Animated.View
          style={[s.spinner, { borderTopColor: '#FFFFFF', transform: [{ rotate }] }]}
        />
        <Text style={s.splashVersion}>v1.0.0</Text>
      </Animated.View>
    </View>
  );
}

// ── Loading overlay (while AsyncStorage hydrates) ────────────────────────────
function LoadingView() {
  const { colors, isDark } = useTheme();
  const fade = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1000, useNativeDriver: true })
    ).start();
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={[s.loading, { backgroundColor: colors.background }]}>
      <Animated.View style={[s.loadingInner, { opacity: fade }]}>
        <Text style={{ fontSize: 48, marginBottom: 24 }}>💰</Text>
        <Animated.View
          style={[
            s.spinner,
            { borderTopColor: colors.primary, borderColor: colors.primary + '30', transform: [{ rotate }] },
          ]}
        />
        <Text style={[s.loadingMsg, { color: colors.textSecondary }]}>
          Loading your expenses…
        </Text>
      </Animated.View>
    </View>
  );
}

// ── Inner app wires splash → loading → main ──────────────────────────────────
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
  // Splash
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashContent: {
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoEmoji: { fontSize: 50 },
  splashTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  splashSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 220,
  },
  splashVersion: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 8,
  },
  // Loading
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingInner: {
    alignItems: 'center',
    gap: 16,
  },
  loadingMsg: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  // Shared spinner
  spinner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
    borderTopColor: '#FFFFFF',
    marginVertical: 16,
  },
});
