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

  // Icon sizes
  icon: {
    small: 16,
    base: 20,
    medium: 24,
    large: 32,
    xlarge: 40,
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
    const padding = 20;
    const gap = 8;
    const availableWidth = screenWidth - padding * 2 - gap * (columns - 1);
    return availableWidth / columns;
  },

  // Screen dimensions
  screenWidth,
  screenHeight,
  isSmallScreen: screenWidth < 380,
  isTablet: screenWidth > 768,
  isLandscape: screenHeight < screenWidth,
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
