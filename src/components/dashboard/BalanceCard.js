import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Shadow, Spacing } from '../../theme/spacing';
import { FontSize, FontWeight } from '../../theme/typography';
import { formatCurrency } from '../../utils/formatters';

const BalanceCard = ({
  monthTotal,
  budgetRemaining,
  monthlyBudget,
  budgetUsed,
  currency = 'PHP',
}) => {
  const { colors } = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const countAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: Math.min(budgetUsed / 100, 1),
        duration: 1000,
        useNativeDriver: false,
        delay: 300,
      }),
      Animated.timing(countAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        delay: 100,
      }),
    ]).start();
  }, [budgetUsed]);

  const barColor = budgetUsed > 90 ? colors.danger : budgetUsed > 70 ? colors.warning : colors.accent;

  return (
    <LinearGradient
      colors={['#6C63FF', '#8B85FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { ...Shadow.xl, shadowColor: '#6C63FF' }]}
    >
      {/* Decorative circles */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>Monthly Spending</Text>
          <Text style={styles.amount}>{formatCurrency(monthTotal, currency)}</Text>
        </View>
        <View style={styles.iconWrap}>
          <MaterialIcons name="account-balance-wallet" size={28} color="rgba(255,255,255,0.9)" />
        </View>
      </View>

      {/* Budget Progress */}
      <View style={styles.budgetSection}>
        <View style={styles.budgetRow}>
          <Text style={styles.budgetLabel}>Budget Used</Text>
          <Text style={styles.budgetPct}>{Math.round(budgetUsed)}%</Text>
        </View>
        <View style={styles.progressBg}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: budgetUsed > 90 ? '#FF5252' : budgetUsed > 70 ? '#FFB347' : '#43D9AD',
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <View style={styles.budgetFooter}>
          <Text style={styles.budgetFooterText}>
            {formatCurrency(budgetRemaining, currency)} remaining
          </Text>
          <Text style={styles.budgetFooterText}>
            of {formatCurrency(monthlyBudget, currency)}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  decorCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -40,
    right: -20,
  },
  decorCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -20,
    left: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  headerLabel: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
    letterSpacing: 0.3,
  },
  amount: {
    fontSize: FontSize['4xl'],
    fontWeight: FontWeight.extraBold,
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetSection: {
    gap: Spacing.sm,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: FontWeight.medium,
  },
  budgetPct: {
    fontSize: FontSize.sm,
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
  progressBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetFooterText: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.65)',
  },
});

export default BalanceCard;