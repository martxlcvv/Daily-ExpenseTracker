import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Shadow, Spacing } from '../../theme/spacing';

const Card = ({
  children,
  style,
  onPress,
  padding = Spacing.base,
  radius = BorderRadius.lg,
  elevation = 'sm',
}) => {
  const { colors } = useTheme();

  const shadowStyle = elevation
    ? {
        ...Shadow[elevation],
        shadowColor: colors.shadow,
      }
    : {};

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.card,
            borderRadius: radius,
            padding,
            borderColor: colors.cardBorder,
            ...shadowStyle,
            opacity: pressed ? 0.92 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: radius,
          padding,
          borderColor: colors.cardBorder,
          ...shadowStyle,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
});

export default Card;