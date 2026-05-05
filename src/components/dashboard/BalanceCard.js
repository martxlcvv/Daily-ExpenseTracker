import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Shadow, Spacing } from '../../theme/spacing';
import { FontSize, FontWeight } from '../../theme/typography';
import { formatCurrency } from '../../utils/formatters';

const BalanceCard = ({
  walletBalance,
  hideBalance,
  onToggleHide,
  totalExpenses,
  currency = 'PHP',
}) => {
  const { colors } = useTheme();
  const countAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(countAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
      delay: 100,
    }).start();
  }, [walletBalance]);

  const displayBalance = hideBalance ? '••••••' : formatCurrency(walletBalance ?? 0, currency);

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

      {/* Header with toggle */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.headerLabel}>Wallet Balance</Text>
          <Text style={styles.subtitle}>Account overview</Text>
        </View>
        <TouchableOpacity
          onPress={onToggleHide}
          style={styles.toggleButton}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={hideBalance ? 'visibility-off' : 'visibility'}
            size={22}
            color="rgba(255,255,255,0.9)"
          />
        </TouchableOpacity>
      </View>

      {/* Balance Display */}
      <Animated.View style={[styles.balanceSection, { opacity: countAnim }]}>
        <Text style={styles.amount}>{displayBalance}</Text>
      </Animated.View>

      {/* Total Spent Info */}
      <View style={styles.infoSection}>
        <Text style={styles.infoLabel}>Total spent</Text>
        <Text style={styles.infoAmount}>{formatCurrency(totalExpenses, currency)}</Text>
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
    marginTop: Spacing.xs,
  },
  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  balanceSection: {
    marginBottom: Spacing.xl,
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
    paddingTop: Spacing.lg,
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