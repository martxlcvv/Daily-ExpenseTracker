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
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['xl'],
    borderWidth: 0,
    backgroundColor: '#111123',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    minWidth: 150,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  amount: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.extraBold,
    letterSpacing: -0.8,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.35,
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