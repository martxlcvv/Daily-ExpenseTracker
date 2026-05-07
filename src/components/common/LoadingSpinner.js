import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../theme/spacing';
import { FontSize } from '../../theme/typography';

// Proper RN spinner — uses individual border colors to avoid the style-merge bug
// where setting borderColor overrides borderTopColor in merged StyleSheet arrays.
const RingSpinner = ({ size = 36, color, strokeWidth = 3, trackOpacity = 0.15 }) => {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
  const trackHex = Math.round(trackOpacity * 255).toString(16).padStart(2, '0');

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
        borderRightColor: color + trackHex,
        borderBottomColor: color + trackHex,
        borderLeftColor: color + trackHex,
        transform: [{ rotate }],
      }}
    />
  );
};

const LoadingSpinner = ({ message, fullScreen = false, size = 'large' }) => {
  const { colors } = useTheme();
  const spinnerSize = size === 'large' ? 40 : size === 'small' ? 24 : 32;

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
        <RingSpinner size={spinnerSize} color={colors.primary} />
        {message && (
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <RingSpinner size={spinnerSize} color={colors.primary} />
      {message && (
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  inline: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  message: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
});

export default LoadingSpinner;