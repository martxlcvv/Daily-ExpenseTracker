import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * The branded splash shown at cold-start before data loads.
 * Fades itself out after ~2.5 s and calls onFinish().
 * Modern violet theme with smooth animations.
 */
const SplashScreen = ({ onFinish }) => {
  const { isDark } = useTheme();
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.82)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        speed: 16,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Spinner animation - store reference to stop it later
    let spinAnimation;
    spinAnimation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1100,
        useNativeDriver: true,
      })
    );
    spinAnimation.start();

    // Auto-dismiss after 2.5 s
    const t = setTimeout(() => {
      // Stop the spinner animation before fading out
      spinAnimation?.stop();
      
      Animated.timing(fade, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }).start(() => onFinish?.());
    }, 2500);

    return () => {
      clearTimeout(t);
      spinAnimation?.stop();
    };
  }, [onFinish]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#0F1419', '#1A1F2E', '#0F1419']
          : ['#6B46C1', '#8B5CF6', '#6B46C1']
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fade,
            transform: [
              { scale },
              { translateY: slideUp },
            ],
          },
        ]}
      >
        {/* Logo circle */}
        <View style={styles.logoWrap}>
          <Text style={styles.logoEmoji}>�</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Daily Ledger</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>Track smarter, spend wiser</Text>

        {/* Spinner */}
        <Animated.View
          style={[
            styles.spinner,
            {
              transform: [{ rotate }],
            },
          ]}
        />

        {/* Version and footer */}
        <Text style={styles.version}>v1.0.0</Text>
        <Text style={styles.author}>Green theme • Modern UI</Text>
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
    gap: 12,
  },
  logoWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    shadowOpacity: 0.2,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 54,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.78)',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 6,
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderTopColor: '#FFFFFF',
    marginTop: 24,
    marginBottom: 12,
  },
  version: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 8,
  },
  author: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
  },
});

export default SplashScreen;
