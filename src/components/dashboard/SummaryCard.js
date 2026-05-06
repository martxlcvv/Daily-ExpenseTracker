import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Shadow } from '../../theme/spacing';
import { FontWeight } from '../../theme/typography';
import { formatCurrency } from '../../utils/formatters';

const SummaryCard = ({ label, amount, icon, color, currency = 'PHP', style }) => {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();

  const amtFontSize = Math.min(width * 0.055, 22);
  const labelFont   = Math.min(width * 0.033, 13);
  const iconSize    = Math.min(width * 0.055, 22);
  const pad         = width < 380 ? 12 : 16;

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
      <View style={[s.iconWrap, { backgroundColor: isDark ? color + '22' : color + '18' }]}>
        <MaterialIcons name={icon} size={iconSize} color={color} />
      </View>
      <Text style={[s.amount, { color: colors.text, fontSize: amtFontSize }]} numberOfLines={1} adjustsFontSizeToFit>
        {formatCurrency(amount, currency)}
      </Text>
      <Text style={[s.label, { color: colors.textSecondary, fontSize: labelFont }]}>{label}</Text>
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'flex-start',
    gap: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  amount: { fontWeight: FontWeight.extraBold, letterSpacing: -0.6 },
  label:  { fontWeight: FontWeight.medium, letterSpacing: 0.2 },
});

export default SummaryCard;