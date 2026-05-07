import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Shadow } from '../../theme/spacing';
import { FontWeight } from '../../theme/typography';
import { formatCurrency } from '../../utils/formatters';

const SummaryCard = ({ label, amount, icon, color, currency = 'PHP', style }) => {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();

  const amtFontSize = Math.min(width * 0.052, 20);
  const labelFont   = Math.min(width * 0.031, 12);
  const iconSize    = Math.min(width * 0.05, 20);
  const pad         = width < 380 ? 13 : 16;

  return (
    <View
      style={[
        s.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          padding: pad,
          ...Shadow.sm,
          shadowColor: colors.shadow,
        },
        style,
      ]}
    >
      {/* Icon */}
      <View style={[s.iconWrap, {
        backgroundColor: isDark ? color + '20' : color + '16',
        borderColor: color + '18',
      }]}>
        <MaterialIcons name={icon} size={iconSize} color={color} />
      </View>

      {/* Amount */}
      <Text
        style={[s.amount, { color: colors.text, fontSize: amtFontSize }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formatCurrency(amount, currency)}
      </Text>

      {/* Label */}
      <Text style={[s.label, { color: colors.textSecondary, fontSize: labelFont }]}>
        {label}
      </Text>
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'flex-start',
    gap: 3,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  amount: {
    fontWeight: FontWeight.extraBold,
    letterSpacing: -0.5,
  },
  label: {
    fontWeight: FontWeight.medium,
    letterSpacing: 0.1,
  },
});

export default SummaryCard;