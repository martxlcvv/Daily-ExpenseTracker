import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Shadow } from '../../theme/spacing';
import { FontWeight } from '../../theme/typography';
import { formatCurrency } from '../../utils/formatters';
import AnimatedButton from '../AnimatedButton';

const BalanceCard = ({
  walletBalance,
  hideBalance,
  onToggleHide,
  totalExpenses,
  currency = 'PHP',
}) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, speed: 14, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [walletBalance]);

  const displayBalance = hideBalance ? '••••••' : formatCurrency(walletBalance ?? 0, currency);

  // Responsive font sizes
  const balanceFontSize = Math.min(width * 0.085, 34);
  const labelFontSize   = Math.min(width * 0.038, 15);
  const infoFontSize    = Math.min(width * 0.033, 13);
  const cardPadding     = width < 380 ? 16 : 20;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: 20 }}>
      <LinearGradient
        colors={colors.gradientCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.card, { padding: cardPadding, ...Shadow.lg, shadowColor: colors.primary }]}
      >
        {/* Decor circles */}
        <View style={[s.decor1, { backgroundColor: 'rgba(255,255,255,0.07)' }]} />
        <View style={[s.decor2, { backgroundColor: 'rgba(255,255,255,0.04)' }]} />

        {/* Header */}
        <View style={s.header}>
          <View style={s.titleWrap}>
            <Text style={[s.label, { fontSize: labelFontSize }]}>Wallet Balance</Text>
            <Text style={[s.sublabel, { fontSize: infoFontSize }]}>Account overview</Text>
          </View>
          <AnimatedButton onPress={onToggleHide} style={s.eyeBtn} scaleAmount={0.9}>
            <MaterialIcons
              name={hideBalance ? 'visibility-off' : 'visibility'}
              size={20}
              color="rgba(255,255,255,0.85)"
            />
          </AnimatedButton>
        </View>

        {/* Balance */}
        <Animated.Text style={[s.balance, { opacity: fadeAnim, fontSize: balanceFontSize }]}>
          {displayBalance}
        </Animated.Text>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={[s.footerLabel, { fontSize: infoFontSize }]}>Total spent</Text>
          <Text style={[s.footerAmt, { fontSize: infoFontSize + 1 }]}>
            {formatCurrency(totalExpenses, currency)}
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  card: {
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    minHeight: 148,
  },
  decor1: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    top: -35, right: -18,
  },
  decor2: {
    position: 'absolute', width: 90, height: 90, borderRadius: 45,
    bottom: -18, left: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  titleWrap: { flex: 1 },
  label: { color: '#FFFFFF', fontWeight: FontWeight.bold, letterSpacing: 0.2 },
  sublabel: { color: 'rgba(255,255,255,0.6)', fontWeight: '400', marginTop: 2 },
  eyeBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balance: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.14)',
  },
  footerLabel: { color: 'rgba(255,255,255,0.6)', fontWeight: '400' },
  footerAmt:   { color: '#FFFFFF', fontWeight: '700' },
});

export default BalanceCard;