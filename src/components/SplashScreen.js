import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * The branded splash shown at cold-start before data loads.
 * Fades itself out after ~2.5 s and calls onFinish().
 */
const SplashScreen = ({ onFinish }) => {
  const { isDark } = useTheme();
  const fade  = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.82)).current;
  const spin  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, speed: 16,     useNativeDriver: true }),
    ]).start();

    // Spinner
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1100, useNativeDriver: true })
    ).start();

    // Auto-dismiss after 2.5 s
    const t = setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: 450, useNativeDriver: true }).start(() =>
        onFinish?.()
      );
    }, 2500);

    return () => clearTimeout(t);
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <LinearGradient
      colors={isDark ? ['#0A0A14', '#1A1A2E', '#0A0A14'] : ['#5A54E8', '#6C63FF', '#8B85FF']}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fade, transform: [{ scale }] }]}>
        <View style={styles.logoWrap}>
          <Text style={styles.logoEmoji}>💰</Text>
        </View>

        <Text style={styles.title}>Daily Ledger</Text>
        <Text style={styles.tagline}>Track smarter, spend wiser</Text>

        <Animated.View
          style={[styles.spinner, { transform: [{ rotate }] }]}
        />

        <Text style={styles.version}>v1.0.0</Text>
        <Text style={styles.author}>by Raymart</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content:   { alignItems: 'center', gap: 10 },
  logoWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoEmoji: { fontSize: 54 },
  title:    { fontSize: 32, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.4 },
  tagline:  { fontSize: 14, color: 'rgba(255,255,255,0.72)', fontWeight: '500', textAlign: 'center' },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
    borderTopColor: '#FFFFFF',
    marginTop: 24,
    marginBottom: 12,
  },
  version: { fontSize: 12, color: 'rgba(255,255,255,0.45)' },
  author:  { fontSize: 12, color: 'rgba(255,255,255,0.35)' },
});

export default SplashScreen;
