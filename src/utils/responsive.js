import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export const ResponsiveSize = {
  // Returns a responsive value based on screen width
  getResponsiveValue: (baseValue, maxValue = baseValue * 2) => {
    if (screenWidth < 380) {
      return baseValue * 0.85;
    } else if (screenWidth < 768) {
      return baseValue;
    } else {
      return Math.min(baseValue * 1.2, maxValue);
    }
  },

  // Responsive font sizes
  fontSize: {
    xs: screenWidth < 380 ? 10 : 12,
    sm: screenWidth < 380 ? 12 : 13,
    base: screenWidth < 380 ? 14 : 16,
    lg: screenWidth < 380 ? 16 : 18,
    xl: screenWidth < 380 ? 18 : 20,
    '2xl': screenWidth < 380 ? 22 : 28,
    '3xl': screenWidth < 380 ? 28 : 36,
  },

  // Responsive spacing/padding
  spacing: {
    xs: screenWidth < 380 ? 4 : 6,
    sm: screenWidth < 380 ? 6 : 8,
    base: screenWidth < 380 ? 12 : 16,
    lg: screenWidth < 380 ? 16 : 20,
    xl: screenWidth < 380 ? 20 : 24,
    '2xl': screenWidth < 380 ? 24 : 32,
  },

  // Icon sizes
  icon: {
    small: screenWidth < 380 ? 14 : 16,
    base: screenWidth < 380 ? 18 : 20,
    medium: screenWidth < 380 ? 22 : 24,
    large: screenWidth < 380 ? 28 : 32,
    xlarge: screenWidth < 380 ? 36 : 40,
  },

  // Category grid columns based on screen width
  getCategoryGridColumns: () => {
    if (screenWidth < 360) return 3;
    if (screenWidth < 480) return 4;
    return 5;
  },

  // Calculate category item size
  getCategoryItemSize: () => {
    const columns = ResponsiveSize.getCategoryGridColumns();
    const padding = ResponsiveSize.spacing.lg;
    const gap = 8;
    const availableWidth = screenWidth - padding * 2 - gap * (columns - 1);
    return availableWidth / columns;
  },

  // Screen breakpoints
  breakpoints: {
    xs: screenWidth < 360,
    sm: screenWidth >= 360 && screenWidth < 480,
    md: screenWidth >= 480 && screenWidth < 768,
    lg: screenWidth >= 768 && screenWidth < 1024,
    xl: screenWidth >= 1024,
  },

  // Screen dimensions
  screenWidth,
  screenHeight,
  isSmallScreen: screenWidth < 380,
  isMediumScreen: screenWidth >= 380 && screenWidth < 768,
  isTablet: screenWidth > 768,
  isLandscape: screenHeight < screenWidth,
  screenRatio: screenWidth / screenHeight,
};


export const getResponsiveFontSize = (baseSize) => {
  if (ResponsiveSize.isSmallScreen) {
    return baseSize * 0.9;
  } else if (ResponsiveSize.isTablet) {
    return baseSize * 1.1;
  }
  return baseSize;
};

export default ResponsiveSize;
