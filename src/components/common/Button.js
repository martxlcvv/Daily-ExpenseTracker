import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing } from '../../theme/spacing';
import { FontSize, FontWeight } from '../../theme/typography';

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary | secondary | outline | ghost | danger
  size = 'md',          // sm | md | lg
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  style,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.965, useNativeDriver: true, damping: 22, stiffness: 300 }).start();

  const pressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 16, stiffness: 200 }).start();

  const sizeMap = {
    sm: { height: 40,  paddingHorizontal: Spacing.md,   borderRadius: BorderRadius.md,  fontSize: FontSize.sm },
    md: { height: 52,  paddingHorizontal: Spacing.xl,   borderRadius: BorderRadius.lg,  fontSize: FontSize.base },
    lg: { height: 58,  paddingHorizontal: Spacing['2xl'], borderRadius: BorderRadius.xl, fontSize: FontSize.lg },
  };

  const sz = sizeMap[size] || sizeMap.md;
  const isDisabled = disabled || loading;

  const renderContent = (textColor) => (
    <View style={s.contentRow}>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left'  && <View style={s.iconLeft}>{icon}</View>}
          <Text style={[s.label, { color: textColor, fontSize: sz.fontSize }]}>{title}</Text>
          {icon && iconPosition === 'right' && <View style={s.iconRight}>{icon}</View>}
        </>
      )}
    </View>
  );

  // ── Primary gradient ──────────────────────────────────────────────────────
  if (variant === 'primary') {
    return (
      <Animated.View style={[
        fullWidth && s.fullWidth,
        { height: sz.height, borderRadius: sz.borderRadius, overflow: 'hidden' },
        { transform: [{ scale: scaleAnim }], opacity: isDisabled ? 0.5 : 1 },
        style,
      ]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={pressIn}
          onPressOut={pressOut}
          disabled={isDisabled}
          activeOpacity={1}
          style={{ flex: 1 }}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[s.gradientFill, { borderRadius: sz.borderRadius }]}
          >
            {renderContent('#FFFFFF')}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // ── Danger gradient ───────────────────────────────────────────────────────
  if (variant === 'danger') {
    return (
      <Animated.View style={[
        fullWidth && s.fullWidth,
        { height: sz.height, borderRadius: sz.borderRadius, overflow: 'hidden' },
        { transform: [{ scale: scaleAnim }], opacity: isDisabled ? 0.5 : 1 },
        style,
      ]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={pressIn}
          onPressOut={pressOut}
          disabled={isDisabled}
          activeOpacity={1}
          style={{ flex: 1 }}
        >
          <LinearGradient
            colors={[colors.danger, '#FF7373']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[s.gradientFill, { borderRadius: sz.borderRadius }]}
          >
            {renderContent('#FFFFFF')}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // ── Flat variants: secondary | outline | ghost ────────────────────────────
  const variantMap = {
    secondary: {
      backgroundColor: colors.surfaceSecondary,
      borderColor: 'transparent',
      borderWidth: 0,
      textColor: colors.primary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: colors.primary,
      borderWidth: 1.5,
      textColor: colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      textColor: colors.textSecondary,
    },
  };

  const vs = variantMap[variant] || variantMap.secondary;

  return (
    <Animated.View style={[
      fullWidth && s.fullWidth,
      {
        height: sz.height,
        borderRadius: sz.borderRadius,
        backgroundColor: vs.backgroundColor,
        borderWidth: vs.borderWidth,
        borderColor: vs.borderColor,
        transform: [{ scale: scaleAnim }],
        opacity: isDisabled ? 0.5 : 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      style,
    ]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={isDisabled}
        activeOpacity={1}
        style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', borderRadius: sz.borderRadius }]}
      >
        {renderContent(vs.textColor)}
      </TouchableOpacity>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  fullWidth: { width: '100%' },
  gradientFill: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: FontWeight.semiBold,
    letterSpacing: 0.2,
  },
  iconLeft:  { marginRight: Spacing.sm },
  iconRight: { marginLeft: Spacing.sm },
});

export default Button;