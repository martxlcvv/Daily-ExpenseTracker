import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing } from '../../theme/spacing';
import { FontSize, FontWeight } from '../../theme/typography';

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary | secondary | outline | ghost | danger
  size = 'md', // sm | md | lg
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  style,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const sizeStyles = {
    sm: { height: 38, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md },
    md: { height: 52, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.lg },
    lg: { height: 60, paddingHorizontal: Spacing['2xl'], borderRadius: BorderRadius.xl },
  };

  const textSizes = { sm: FontSize.sm, md: FontSize.base, lg: FontSize.lg };

  const renderContent = (textColor) => (
    <View style={styles.contentRow}>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[styles.label, { color: textColor, fontSize: textSizes[size] }]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </>
      )}
    </View>
  );

  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <Animated.View
        style={[
          fullWidth && styles.fullWidth,
          sizeStyles[size],
          { transform: [{ scale: scaleAnim }], opacity: isDisabled ? 0.5 : 1 },
          style,
        ]}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
          activeOpacity={1}
          style={{ flex: 1, borderRadius: sizeStyles[size].borderRadius, overflow: 'hidden' }}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientBtn, { borderRadius: sizeStyles[size].borderRadius }]}
          >
            {renderContent('#FFFFFF')}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (variant === 'danger') {
    return (
      <Animated.View
        style={[
          fullWidth && styles.fullWidth,
          sizeStyles[size],
          { transform: [{ scale: scaleAnim }], opacity: isDisabled ? 0.5 : 1 },
          style,
        ]}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
          activeOpacity={1}
          style={{ flex: 1, borderRadius: sizeStyles[size].borderRadius, overflow: 'hidden' }}
        >
          <LinearGradient
            colors={[colors.danger, '#FF7676']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientBtn, { borderRadius: sizeStyles[size].borderRadius }]}
          >
            {renderContent('#FFFFFF')}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  const variantStyles = {
    secondary: {
      backgroundColor: colors.surfaceSecondary,
      borderColor: 'transparent',
      textColor: colors.primary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: colors.primary,
      textColor: colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      textColor: colors.textSecondary,
    },
  };

  const vs = variantStyles[variant] || variantStyles.secondary;

  return (
    <Animated.View
      style={[
        fullWidth && styles.fullWidth,
        sizeStyles[size],
        {
          transform: [{ scale: scaleAnim }],
          opacity: isDisabled ? 0.5 : 1,
          backgroundColor: vs.backgroundColor,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: vs.borderColor,
          borderRadius: sizeStyles[size].borderRadius,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={1}
        style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}
      >
        {renderContent(vs.textColor)}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  gradientBtn: {
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
    letterSpacing: 0.3,
  },
  iconLeft: { marginRight: Spacing.sm },
  iconRight: { marginLeft: Spacing.sm },
});

export default Button;