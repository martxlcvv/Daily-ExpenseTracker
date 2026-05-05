import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// Routes that live inside TabNavigator (Home screen)
const TAB_ROUTES = new Set(['Dashboard', 'Expenses', 'Analytics', 'Search']);

const MENU_ITEMS = [
  { label: 'Dashboard',      route: 'Dashboard',      icon: 'dashboard' },
  { label: 'Expenses',       route: 'Expenses',        icon: 'receipt-long' },
  { label: 'Analytics',      route: 'Analytics',       icon: 'insights' },
  { label: 'Search',         route: 'Search',          icon: 'search' },
  { label: 'Delete History', route: 'DeleteHistory',   icon: 'history' },
  { label: 'Settings',       route: 'Settings',        icon: 'settings' },
];

const DrawerMenu = ({ visible, onClose, navigation }) => {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(-320)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          speed: 20,
          bounciness: 4,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -320,
          duration: 220,
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

  if (!visible) return null;

  const handleNavigate = (route) => {
    onClose();
    // Give drawer time to start closing before navigating
    setTimeout(() => {
      if (TAB_ROUTES.has(route)) {
        // Navigate to the Home stack screen, then jump to the right tab
        navigation.navigate('Home', { screen: route });
      } else {
        navigation.navigate(route);
      }
    }, 80);
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Dimmed backdrop */}
      <Animated.View
        style={[styles.backdrop, { opacity: overlayAnim }]}
        pointerEvents="auto"
      >
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      </Animated.View>

      {/* Sliding panel */}
      <Animated.View
        style={[
          styles.panel,
          {
            backgroundColor: colors.surface,
            borderRightColor: colors.cardBorder,
            transform: [{ translateX: slideAnim }],
          },
        ]}
        pointerEvents="auto"
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.separator }]}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary + '20' }]}>
            <Text style={styles.logoEmoji}>💰</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.appName, { color: colors.text }]}>Daily Ledger</Text>
            <Text style={[styles.appTagline, { color: colors.textSecondary }]}>
              Expense Tracker
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
          >
            <MaterialIcons name="close" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuItems}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.route}
              onPress={() => handleNavigate(item.route)}
              style={[styles.menuItem]}
              activeOpacity={0.7}
            >
              <View
                style={[styles.itemIcon, { backgroundColor: colors.primary + '18' }]}
              >
                <MaterialIcons name={item.icon} size={20} color={colors.primary} />
              </View>
              <Text style={[styles.itemLabel, { color: colors.text }]}>{item.label}</Text>
              <MaterialIcons name="chevron-right" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.separator }]}>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            v1.0.0 · Made with ❤️
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 998,
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '76%',
    maxWidth: 320,
    zIndex: 999,
    borderRightWidth: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    gap: 12,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 22 },
  headerText: { flex: 1 },
  appName: { fontSize: 16, fontWeight: '700' },
  appTagline: { fontSize: 12, marginTop: 1 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItems: { paddingHorizontal: 12, paddingTop: 8 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 2,
    gap: 14,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  footerText: { fontSize: 12, textAlign: 'center' },
});

export default DrawerMenu;
