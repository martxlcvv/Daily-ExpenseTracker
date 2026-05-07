import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../theme/spacing';
import { FontSize, FontWeight } from '../../theme/typography';
import Button from './Button';

const EmptyState = ({
  icon = 'inbox',
  title = 'Nothing here yet',
  subtitle,
  actionLabel,
  onAction,
  style,
}) => {
  const { colors } = useTheme();
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, damping: 18, stiffness: 160, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[
      styles.container,
      style,
      { opacity: fade, transform: [{ translateY: slide }, { scale }] },
    ]}>
      {/* Icon ring */}
      <View style={[styles.iconRing, { backgroundColor: colors.surfaceSecondary, borderColor: colors.cardBorder }]}>
        <MaterialIcons name={icon} size={36} color={colors.textTertiary} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      )}

      {actionLabel && onAction && (
        <View style={{ marginTop: Spacing.lg }}>
          <Button
            title={actionLabel}
            onPress={onAction}
            size="sm"
            fullWidth={false}
          />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  iconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semiBold,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.1,
    maxWidth: 240,
  },
});

export default EmptyState;