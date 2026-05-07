import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ExpenseProvider, useExpenses } from './src/context/ExpenseContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

// ── Spinner component (fixed: individual border colors avoid RN style-merge bug) ──
const Spinner = ({ size = 40, color = '#FFFFFF', trackOpacity = 0.18, strokeWidth = 3 }) => {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    spin.setValue(0);
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    return () => spin.stopAnimation();
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderTopWidth: strokeWidth,
        borderRightWidth: strokeWidth,
        borderBottomWidth: strokeWidth,
        borderLeftWidth: strokeWidth,
        borderTopColor: color,
        borderRightColor: color + Math.round(trackOpacity * 255).toString(16).padStart(2, '0'),
        borderBottomColor: color + Math.round(trackOpacity * 255).toString(16).padStart(2, '0'),
        borderLeftColor: color + Math.round(trackOpacity * 255).toString(16).padStart(2, '0'),
        transform: [{ rotate }],
      }}
    />
  );
};

// ── Splash screen ─────────────────────────────────────────────────────────────
function SplashView({ onDone }) {
  const { isDark } = useTheme();
  const fade   = useRef(new Animated.Value(0)).current;
  const scale  = useRef(new Animated.Value(0.82)).current;
  const slideY = useRef(new Animated.Value(24)).current;
  const { width } = useWindowDimensions();

  const logoSize  = Math.min(width * 0.2, 88);
  const titleSize = Math.min(width * 0.072, 28);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,   { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(scale,  { toValue: 1, damping: 16, stiffness: 140, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: 400, easing: Easing.in(Easing.cubic), useNativeDriver: true })
        .start(() => onDone());
    }, 2600);

    return () => clearTimeout(t);
  }, []);

  const bg = isDark ? '#0D1117' : '#13091F';

  return (
    <View style={[s.splash, { backgroundColor: bg }]}>
      {/* Subtle radial glow */}
      <View style={[s.glow, { backgroundColor: 'rgba(108,99,255,0.12)', width: width * 1.4, height: width * 1.4, borderRadius: width * 0.7 }]} />

      <Animated.View style={[s.splashContent, { opacity: fade, transform: [{ scale }, { translateY: slideY }] }]}>
        {/* Logo */}
        <View style={[s.logoCircle, { width: logoSize, height: logoSize, borderRadius: logoSize / 2 }]}>
          <Text style={{ fontSize: logoSize * 0.5 }}>💰</Text>
        </View>

        {/* App name */}
        <Text style={[s.splashTitle, { fontSize: titleSize }]}>Daily Ledger</Text>
        <Text style={s.splashTagline}>Track smarter, spend wiser</Text>

        {/* Spinner */}
        <View style={{ marginTop: 40 }}>
          <Spinner size={36} color="#6C63FF" trackOpacity={0.2} strokeWidth={3} />
        </View>

        <Text style={s.splashVersion}>v1.0.0</Text>
      </Animated.View>
    </View>
  );
}

// ── Loading overlay ────────────────────────────────────────────────────────────
function LoadingView() {
  const { colors } = useTheme();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={[s.loading, { backgroundColor: colors.background }]}>
      <Animated.View style={[s.loadingInner, { opacity: fade }]}>
        <Text style={{ fontSize: 40, marginBottom: 24 }}>💰</Text>
        <Spinner size={38} color={colors.primary} trackOpacity={0.18} strokeWidth={3} />
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
  // Splash
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    top: '-20%',
    left: '-20%',
    opacity: 0.8,
  },
  splashContent: {
    alignItems: 'center',
    gap: 8,
  },
  logoCircle: {
    backgroundColor: 'rgba(108,99,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.25)',
  },
  splashTitle: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  splashTagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '400',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  splashVersion: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.22)',
    marginTop: 16,
    letterSpacing: 0.5,
  },

  // Loading
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingInner: {
    alignItems: 'center',
    gap: 0,
  },
  loadingMsg: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 20,
    letterSpacing: 0.1,
  },
});