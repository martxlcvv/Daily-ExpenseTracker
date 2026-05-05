import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Spacing } from '../theme/spacing';
import { FontSize, FontWeight } from '../theme/typography';

const SplashScreen = ({ onFinish }) => {
  const { colors, isDark } = useTheme();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
      }),
    ]).start();

    // Auto finish after 3 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        onFinish?.();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={isDark ? ['#0A0A14', '#1A1A2E', '#0A0A14'] : ['#6C63FF', '#8B85FF', '#6C63FF']}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo Circle */}
        <View style={[styles.logoCircle, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
          <Text style={styles.logoEmoji}>💰</Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: 'white' }]}>Daily Expense Tracker</Text>

        {/* Version */}
        <Text style={[styles.version, { color: 'rgba(255,255,255,0.8)' }]}>Version 1.0.0</Text>

        {/* Developer */}
        <Text style={[styles.developer, { color: 'rgba(255,255,255,0.6)' }]}>
          Developed by Raymart
        </Text>

        {/* Loading Indicator */}
        <View style={styles.loaderContainer}>
          <View style={[styles.loaderDot, { backgroundColor: 'white' }]} />
          <View style={[styles.loaderDot, { backgroundColor: 'white' }]} />
          <View style={[styles.loaderDot, { backgroundColor: 'white' }]} />
        </View>

        {/* Tagline */}
        <Text style={[styles.tagline, { color: 'rgba(255,255,255,0.7)' }]}>
          Track your expenses, reach your goals
        </Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  logoEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.extraBold,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  version: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    marginBottom: Spacing.sm,
  },
  developer: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing['2xl'],
  },
  loaderContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginVertical: Spacing.xl,
  },
  loaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
  tagline: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.lg,
  },
});

export default SplashScreen;
