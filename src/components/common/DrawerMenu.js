import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const DrawerMenu = ({ visible, onClose, navigation }) => {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    Animated.timing(opacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  if (!visible) return null;

  const items = [
    { label: 'Dashboard', route: 'Dashboard', icon: 'home' },
    { label: 'Expenses', route: 'Expenses', icon: 'receipt-long' },
    { label: 'Analytics', route: 'Analytics', icon: 'insights' },
    { label: 'Search', route: 'Search', icon: 'search' },
    { label: 'Delete History', route: 'DeleteHistory', icon: 'history' },
    { label: 'Settings', route: 'Settings', icon: 'settings' },
  ];

  const handleNavigate = (route) => {
    onClose();
    navigation.navigate(route);
  };

  return (
    <Animated.View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.45)', opacity }]}> 
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}> 
        <View style={[styles.header, { borderBottomColor: colors.separator }]}> 
          <Text style={[styles.title, { color: colors.text }]}>Menu</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        {items.map((item) => (
          <TouchableOpacity
            key={item.route}
            onPress={() => handleNavigate(item.route)}
            style={styles.menuItem}
          >
            <View style={[styles.itemIcon, { backgroundColor: colors.primary + '15' }]}> 
              <MaterialIcons name={item.icon} size={20} color={colors.primary} />
            </View>
            <Text style={[styles.itemLabel, { color: colors.text }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    zIndex: 999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  panel: {
    width: '72%',
    minHeight: '100%',
    paddingTop: 60,
    paddingHorizontal: 18,
    borderRightWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 18,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DrawerMenu;
