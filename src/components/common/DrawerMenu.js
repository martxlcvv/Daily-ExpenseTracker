/**
 * DrawerMenu.js — Stable slide-in sidebar using Modal
 * Fixes: glitch on open/close, state resets, layout bleeding
 */
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useExpenses } from '../../context/ExpenseContext';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/formatters';

const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.8, 320);

const MENU_ITEMS = [
  { icon: 'dashboard',          label: 'Dashboard',        screen: 'Dashboard',       tab: true  },
  { icon: 'receipt-long',       label: 'Expenses',         screen: 'Expenses',        tab: true  },
  { icon: 'insights',           label: 'Analytics',        screen: 'Analytics',       tab: true  },
  { icon: 'search',             label: 'Search',           screen: 'Search',          tab: true  },
  { icon: 'trending-up',        label: 'Investments',      screen: 'Investment',      tab: false },
  { icon: 'bar-chart',          label: 'Statistics',       screen: 'Statistics',      tab: false },
  { icon: 'shopping-cart',      label: 'Shopping List',    screen: 'ShoppingList',    tab: false },
  { icon: 'event-note',         label: 'Planned Payments', screen: 'PlannedPayments', tab: false },
  { icon: 'account-balance',    label: 'Bank Accounts',    screen: 'BankAccounts',    tab: false },
  { icon: 'history',            label: 'Delete History',   screen: 'DeleteHistory',   tab: false },
  { icon: 'settings',           label: 'Settings',         screen: 'Settings',        tab: false },
];

export default function DrawerMenu({ visible, onClose, navigation }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { settings, expenses } = useExpenses();
  const insets = useSafeAreaInsets();

  const slideAnim   = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  // Animate open/close without resetting component state
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 180,
          mass: 0.8,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleNavigate = useCallback((item) => {
    onClose();
    // Small delay so animation completes before navigation
    setTimeout(() => {
      if (item.tab) {
        navigation.navigate('Home', { screen: item.screen });
      } else {
        navigation.navigate(item.screen);
      }
    }, 180);
  }, [navigation, onClose]);

  const firstName = settings?.firstName || 'User';
  const currency  = settings?.currency  || 'PHP';
  const balance   = settings?.walletBalance ?? 0;
  const bankTotal  = (settings?.bankAccounts || []).reduce((sum, bank) => sum + (Number(bank.balance) || 0), 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Scrim — tap to close */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(0,0,0,0.55)', opacity: overlayAnim },
          ]}
        />
      </Pressable>

      {/* Drawer panel */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_WIDTH,
            backgroundColor: colors.card,
            transform: [{ translateX: slideAnim }],
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 12,
          },
        ]}
      >
        {/* Header gradient */}
        <LinearGradient
          colors={isDark ? ['#1E2548', '#141830'] : ['#6C63FF', '#9D96FF']}
          style={styles.drawerHeader}
        >
          <View style={[styles.avatarCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={styles.avatarInitials}>
              {firstName.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.drawerName}>{firstName}</Text>
          <Text style={styles.drawerBalance}>
            {formatCurrency(balance, currency)}
          </Text>
          <Text style={styles.drawerBalanceLabel}>Wallet Balance</Text>
          <Text style={[styles.drawerSub, { color: 'rgba(255,255,255,0.75)' }]}>Bank: {formatCurrency(bankTotal, currency)}</Text>

          {/* Theme toggle in header */}
          <TouchableOpacity
            onPress={toggleTheme}
            style={styles.themeBtn}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={isDark ? 'light-mode' : 'dark-mode'}
              size={18}
              color="rgba(255,255,255,0.85)"
            />
          </TouchableOpacity>
        </LinearGradient>

        {/* Nav items */}
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.menuList}
        >
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.screen}
              onPress={() => handleNavigate(item)}
              activeOpacity={0.72}
              style={[
                styles.menuItem,
                { borderBottomColor: colors.separator },
              ]}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.surfaceSecondary }]}>
                <MaterialIcons name={item.icon} size={19} color={colors.primary} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
              <MaterialIcons name="chevron-right" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.drawerFooter, { borderTopColor: colors.separator }]}>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            Daily Ledger • v1.0.0
          </Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    elevation: 24,
    shadowOffset: { width: 4, height: 0 },
    shadowRadius: 20,
    shadowOpacity: 0.3,
  },
  drawerHeader: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 28,
    alignItems: 'center',
    gap: 4,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  drawerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  drawerBalance: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginTop: 6,
  },
  drawerBalanceLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  drawerSub: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.25,
    marginTop: 6,
  },
  themeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuList: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 18,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  drawerFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});