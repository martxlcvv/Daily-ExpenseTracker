import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Spacing } from '../theme/spacing';
import { FontSize, FontWeight } from '../theme/typography';

const SplashScreen = ({ message = 'Loading your expenses...' }) => {
  const { colors, isDark } = useTheme();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Spinning animation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [spinAnim, fadeAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={isDark ? ['#0a0e27', '#16213e'] : ['#f5f5f5', '#ffffff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo/App Name */}
        <View style={styles.logoContainer}>
          <Text style={[styles.appName, { color: colors.primary }]}>
            💰
          </Text>
          <Text style={[styles.appTitle, { color: colors.text }]}>
            Expense Tracker
          </Text>
        </View>

        {/* Spinner */}
        <Animated.View
          style={[
            styles.spinner,
            {
              borderColor: colors.primary + '30',
              borderTopColor: colors.primary,
              transform: [{ rotate: spin }],
            },
          ]}
        />

        {/* Message */}
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>

        {/* Decorative dots */}
        <View style={styles.dots}>
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: colors.primary,
                opacity: spinAnim.interpolate({
                  inputRange: [0, 0.33, 0.66, 1],
                  outputRange: [0.3, 1, 0.3, 0.3],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: colors.primary,
                opacity: spinAnim.interpolate({
                  inputRange: [0, 0.33, 0.66, 1],
                  outputRange: [0.3, 0.3, 1, 0.3],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: colors.primary,
                opacity: spinAnim.interpolate({
                  inputRange: [0, 0.33, 0.66, 1],
                  outputRange: [0.3, 0.3, 0.3, 1],
                }),
              },
            ]}
          />
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  content: {
    alignItems: 'center',
    gap: Spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  appName: {
    fontSize: 60,
  },
  appTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  spinner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
  },
  message: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default SplashScreen;
