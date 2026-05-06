import { MaterialIcons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius } from '../../theme/spacing';
import { FontWeight } from '../../theme/typography';
import { getCategoryById } from '../../utils/categories';
import { formatCurrency, formatTime, truncateText } from '../../utils/formatters';

const ExpenseItem = ({ expense, onPress, onDelete, currency = 'PHP' }) => {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const category = getCategoryById(expense.category);

  const handlePressIn  = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, speed: 50 }).start();

  const iconBg = isDark ? category.darkColor : category.lightColor;
  const iconSize  = Math.min(width * 0.11, 46);
  const iconInner = iconSize * 0.46;
  const amtFont   = Math.min(width * 0.038, 15);
  const nameFont  = Math.min(width * 0.036, 14);
  const noteFont  = Math.min(width * 0.03, 12);
  const pad       = width < 380 ? 10 : 12;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: 6 }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[s.row, {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          padding: pad,
          borderRadius: BorderRadius.lg,
        }]}
      >
        {/* Icon */}
        <View style={[s.icon, { backgroundColor: iconBg, width: iconSize, height: iconSize, borderRadius: iconSize * 0.3 }]}>
          <MaterialIcons name={category.icon} size={iconInner} color={category.color} />
        </View>

        {/* Info */}
        <View style={s.info}>
          <Text style={[s.name, { color: colors.text, fontSize: nameFont }]} numberOfLines={1}>
            {expense.name || category.name}
          </Text>
          {expense.note
            ? <Text style={[s.note, { color: colors.textSecondary, fontSize: noteFont }]} numberOfLines={1}>
                {truncateText(expense.note, 32)}
              </Text>
            : <Text style={[s.note, { color: colors.textTertiary, fontSize: noteFont }]}>{category.name}</Text>
          }
          <Text style={[s.time, { color: colors.textTertiary, fontSize: noteFont - 1 }]}>
            {formatTime(expense.date)}
          </Text>
        </View>

        {/* Amount + delete */}
        <View style={s.right}>
          <Text style={[s.amt, { color: colors.text, fontSize: amtFont }]}>
            {formatCurrency(expense.amount, currency)}
          </Text>
          {onDelete && (
            <TouchableOpacity
              onPress={() => onDelete(expense.id)}
              style={[s.delBtn, { backgroundColor: colors.surfaceSecondary }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="delete-outline" size={14} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  icon: { alignItems: 'center', justifyContent: 'center', marginRight: 10, flexShrink: 0 },
  info: { flex: 1, gap: 1 },
  name: { fontWeight: FontWeight.semiBold },
  note: {},
  time: { marginTop: 1 },
  right: { alignItems: 'flex-end', gap: 4, marginLeft: 8, flexShrink: 0 },
  amt: { fontWeight: FontWeight.bold },
  delBtn: { width: 26, height: 26, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
});

export default ExpenseItem;