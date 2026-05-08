import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ExpenseProvider, useExpenses } from './src/context/ExpenseContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

// ── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D1117', padding: 20 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 18, marginBottom: 10 }}>Oops! May error sa app 😅</Text>
          <Text style={{ color: '#CCCCCC', fontSize: 14, textAlign: 'center' }}>
            {this.state.error?.message || 'Unknown error'}
          </Text>
          <Text style={{ color: '#AAAAAA', fontSize: 12, marginTop: 20, textAlign: 'center' }}>
            Try restarting the app or clearing data.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// ── Spinner ──────────────────────────────────────────────────────────────────

// ── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = ({ size = 40, color = '#FFFFFF', trackOpacity = 0.18, strokeWidth = 3 }) => {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const track = Math.round(trackOpacity * 255).toString(16).padStart(2, '0');
  return (
    <Animated.View style={{
      width: size, height: size, borderRadius: size / 2,
      borderTopWidth: strokeWidth, borderRightWidth: strokeWidth,
      borderBottomWidth: strokeWidth, borderLeftWidth: strokeWidth,
      borderTopColor: color,
      borderRightColor: color + track, borderBottomColor: color + track, borderLeftColor: color + track,
      transform: [{ rotate }],
    }} />
  );
};

// ── Splash ───────────────────────────────────────────────────────────────────
function SplashView({ onDone }) {
  const fade   = useRef(new Animated.Value(0)).current;
  const scale  = useRef(new Animated.Value(0.8)).current;
  const slideY = useRef(new Animated.Value(30)).current;
  const glow   = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();

  useEffect(() => {
    // Entrance
    Animated.parallel([
      Animated.timing(fade,   { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(scale,  { toValue: 1, damping: 14, stiffness: 130, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    // Glow pulse
    Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      Animated.timing(glow, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
    ])).start();

    // Exit after 2.8s
    const t = setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: 450, easing: Easing.in(Easing.cubic), useNativeDriver: true })
        .start(({ finished }) => { if (finished) onDone(); });
    }, 2800);
    return () => clearTimeout(t);
  }, []);

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.22] });
  const logoSize = Math.min(width * 0.22, 96);

  return (
    <View style={s.splash}>
      {/* Background */}
      <View style={StyleSheet.absoluteFill}>
        <View style={[s.bgGrad, { backgroundColor: '#0D1117' }]} />
        <Animated.View style={[s.glowOrb, {
          width: width * 1.6, height: width * 1.6,
          borderRadius: width * 0.8, top: -width * 0.5, left: -width * 0.3,
          backgroundColor: '#6C63FF', opacity: glowOpacity,
        }]} />
        <Animated.View style={[s.glowOrb, {
          width: width * 1.0, height: width * 1.0,
          borderRadius: width * 0.5, bottom: -width * 0.3, right: -width * 0.2,
          backgroundColor: '#8B5CF6', opacity: glowOpacity,
        }]} />
      </View>

      <Animated.View style={[s.splashContent, { opacity: fade, transform: [{ scale }, { translateY: slideY }] }]}>
        {/* Logo */}
        <View style={[s.logoWrap, { width: logoSize, height: logoSize, borderRadius: logoSize / 2 }]}>
          <Text style={{ fontSize: logoSize * 0.52 }}>💰</Text>
        </View>

        {/* Tagline */}
        <Text style={[s.splashTitle, { fontSize: Math.min(width * 0.075, 30) }]}>Daily Ledger</Text>
        <Text style={s.splashTagline}>Mag-ipon tayo, 'wag palayas ng pera! 💸</Text>

        <View style={{ marginTop: 36 }}>
          <Spinner size={38} color="#6C63FF" trackOpacity={0.2} strokeWidth={3.5} />
        </View>
        <Text style={s.splashVersion}>v1.0.0 · Dark Theme</Text>
      </Animated.View>
    </View>
  );
}

// ── Loading overlay ───────────────────────────────────────────────────────────
function LoadingView() {
  const { colors } = useTheme();
  const fade  = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, damping: 16, stiffness: 140, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <View style={[s.loading, { backgroundColor: colors.background }]}>
      <Animated.View style={[s.loadingInner, { opacity: fade, transform: [{ scale }] }]}>
        <Text style={{ fontSize: 44, marginBottom: 24 }}>💰</Text>
        <Spinner size={40} color={colors.primary} trackOpacity={0.18} strokeWidth={3} />
        <Text style={[s.loadingMsg, { color: colors.textSecondary }]}>
          Kino-load ang iyong expenses…
        </Text>
        <Text style={[s.loadingSubMsg, { color: colors.textTertiary }]}>
          Sandali lang, bestie! 🙏
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
    <ErrorBoundary>
      <ThemeProvider>
        <ExpenseProvider>
          <AppContent />
        </ExpenseProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const s = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D1117' },
  bgGrad: { ...StyleSheet.absoluteFillObject },
  glowOrb: { position: 'absolute' },
  splashContent: { alignItems: 'center', gap: 10, paddingHorizontal: 32, zIndex: 10 },
  logoWrap: {
    backgroundColor: 'rgba(108,99,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, borderWidth: 1.5, borderColor: 'rgba(108,99,255,0.35)',
  },
  splashTitle: { fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5, marginTop: 4 },
  splashTagline: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '400', textAlign: 'center', marginTop: 2 },
  splashVersion: { fontSize: 11, color: 'rgba(255,255,255,0.22)', marginTop: 18, letterSpacing: 0.5 },

  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingInner: { alignItems: 'center', gap: 0 },
  loadingMsg: { fontSize: 14, fontWeight: '600', marginTop: 22, letterSpacing: 0.1, textAlign: 'center' },
  loadingSubMsg: { fontSize: 12, marginTop: 6, textAlign: 'center' },
});