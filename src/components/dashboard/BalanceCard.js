import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius } from '../../theme/spacing';
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

  const scaleAnim = useRef(new Animated.Value(0.94)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, damping: 18, stiffness: 160, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [walletBalance]);

  const displayBalance = hideBalance ? '• • • • • •' : formatCurrency(walletBalance ?? 0, currency);

  const balanceFontSize = Math.min(width * 0.082, 32);
  const labelFontSize   = Math.min(width * 0.036, 14);
  const infoFontSize    = Math.min(width * 0.031, 12);
  const cardPadding     = width < 380 ? 18 : 22;

  return (
    <Animated.View style={[{ marginBottom: 18 }, {
      transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
      opacity: fadeAnim,
    }]}>
      <LinearGradient
        colors={colors.gradientCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.card, {
          padding: cardPadding,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 12 },
          shadowRadius: 28,
          shadowOpacity: 0.3,
          elevation: 12,
        }]}
      >
        {/* Decorative orbs */}
        <View style={s.orb1} />
        <View style={s.orb2} />
        <View style={s.orb3} />

        {/* Header */}
        <View style={s.header}>
          <View style={s.titleWrap}>
            <Text style={[s.label, { fontSize: labelFontSize }]}>Wallet Balance</Text>
            <Text style={[s.sublabel, { fontSize: infoFontSize }]}>Account overview</Text>
          </View>
          <AnimatedButton onPress={onToggleHide} style={s.eyeBtn} scaleAmount={0.88}>
            <MaterialIcons
              name={hideBalance ? 'visibility-off' : 'visibility'}
              size={18}
              color="rgba(255,255,255,0.75)"
            />
          </AnimatedButton>
        </View>

        {/* Balance */}
        <Animated.Text
          style={[s.balance, { fontSize: balanceFontSize }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {displayBalance}
        </Animated.Text>

        {/* Footer divider */}
        <View style={s.footer}>
          <View style={s.footerLeft}>
            <MaterialIcons name="arrow-upward" size={12} color="rgba(255,255,255,0.5)" style={{ marginRight: 4 }} />
            <Text style={[s.footerLabel, { fontSize: infoFontSize }]}>Total spent</Text>
          </View>
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
    minHeight: 152,
  },
  orb1: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    top: -50, right: -30,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  orb2: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    bottom: -20, left: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  orb3: {
    position: 'absolute', width: 50, height: 50, borderRadius: 25,
    top: 10, right: 80,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleWrap: { flex: 1 },
  label: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: FontWeight.bold,
    letterSpacing: 0.2,
  },
  sublabel: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '400',
    marginTop: 3,
  },
  eyeBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balance: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '400',
  },
  footerAmt: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default BalanceCard;