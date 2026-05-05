import { Platform } from 'react-native';

export const FontFamily = {
  regular: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  medium: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto-Medium',
  semiBold: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto-Medium',
  bold: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto-Bold',
  mono: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
};

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
  display: 48,
};

export const FontWeight = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
};

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

export const Typography = {
  displayLarge: {
    fontSize: FontSize['5xl'],
    fontWeight: FontWeight.extraBold,
    letterSpacing: -1.5,
  },
  displayMedium: {
    fontSize: FontSize['4xl'],
    fontWeight: FontWeight.bold,
    letterSpacing: -1,
  },
  headlineLarge: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  },
  headlineMedium: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.semiBold,
    letterSpacing: -0.3,
  },
  titleLarge: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semiBold,
    letterSpacing: -0.2,
  },
  titleMedium: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semiBold,
  },
  bodyLarge: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
  },
  labelLarge: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.1,
  },
  labelSmall: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
};