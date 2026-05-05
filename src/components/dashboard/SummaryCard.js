import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Shadow, Spacing } from '../../theme/spacing';
import { FontSize, FontWeight } from '../../theme/typography';
import { formatCurrency } from '../../utils/formatters';

const SummaryCard = ({ label, amount, icon, color, currency = 'PHP', trend }) => {
  const { colors, isDark } = useTheme();
  const bgColor = isDark
    ? `${color}22`
    : `${color}18`;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          ...Shadow.sm,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: bgColor }]}>
        <MaterialIcons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.amount, { color: colors.text }]}>
        {formatCurrency(amount, currency)}
      </Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      {trend !== undefined && (
        <View style={styles.trendRow}>
          <MaterialIcons
            name={trend >= 0 ? 'arrow-upward' : 'arrow-downward'}
            size={12}
            color={trend >= 0 ? colors.danger : colors.success}
          />
          <Text style={[styles.trendText, { color: trend >= 0 ? colors.danger : colors.success }]}>
            {Math.abs(trend).toFixed(1)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  amount: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.2,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
  },
});

export default SummaryCard;