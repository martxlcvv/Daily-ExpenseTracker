import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Shadow } from '../../theme/spacing';
import { FontSize, FontWeight } from '../../theme/typography';
import { formatCurrency } from '../../utils/formatters';
import { ResponsiveSize } from '../../utils/responsive';
import AnimatedButton from '../AnimatedButton';

const BalanceCard = ({
  walletBalance,
  hideBalance,
  onToggleHide,
  totalExpenses,
  currency = 'PHP',
}) => {
  const { colors, isDark } = useTheme();
  const countAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(countAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        speed: 12,
        useNativeDriver: true,
      }),
    ]).start();
  }, [walletBalance]);

  const displayBalance = hideBalance ? '••••••' : formatCurrency(walletBalance ?? 0, currency);

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={colors.gradientCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            ...Shadow.lg,
            shadowColor: colors.primary,
          },
        ]}
      >
        {/* Decorative elements */}
        <View
          style={[
            styles.decorCircle1,
            { backgroundColor: 'rgba(255,255,255,0.08)' },
          ]}
        />
        <View
          style={[
            styles.decorCircle2,
            { backgroundColor: 'rgba(255,255,255,0.05)' },
          ]}
        />

        {/* Header with toggle */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.headerLabel}>Wallet Balance</Text>
            <Text style={styles.subtitle}>Account overview</Text>
          </View>
          <AnimatedButton
            onPress={onToggleHide}
            style={styles.toggleButton}
            scaleAmount={0.92}
          >
            <MaterialIcons
              name={hideBalance ? 'visibility-off' : 'visibility'}
              size={ResponsiveSize.icon.medium}
              color="rgba(255,255,255,0.9)"
            />
          </AnimatedButton>
        </View>

        {/* Balance Display */}
        <Animated.View style={[styles.balanceSection, { opacity: countAnim }]}>
          <Text
            style={[
              styles.amount,
              { fontSize: ResponsiveSize.fontSize['2xl'] },
            ]}
          >
            {displayBalance}
          </Text>
        </Animated.View>

        {/* Total Spent Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Total spent</Text>
          <Text style={styles.infoAmount}>{formatCurrency(totalExpenses, currency)}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius['2xl'],
    padding: ResponsiveSize.spacing.lg,
    overflow: 'hidden',
    marginBottom: ResponsiveSize.spacing.lg,
    minHeight: 160,
  },
  decorCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    top: -40,
    right: -20,
  },
  decorCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    bottom: -20,
    left: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: ResponsiveSize.spacing.lg,
  },
  titleContainer: {
    flex: 1,
  },
  headerLabel: {
    fontSize: FontSize.lg,
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: FontWeight.medium,
    marginTop: ResponsiveSize.spacing.xs,
  },
  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: ResponsiveSize.spacing.sm,
  },
  balanceSection: {
    marginBottom: ResponsiveSize.spacing.lg,
  },
  amount: {
    fontSize: FontSize['5xl'],
    fontWeight: FontWeight.extraBold,
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: ResponsiveSize.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  infoLabel: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: FontWeight.medium,
  },
  infoAmount: {
    fontSize: FontSize.lg,
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
});

export default BalanceCard;