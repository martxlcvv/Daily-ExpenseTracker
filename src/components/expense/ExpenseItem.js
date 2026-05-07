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
  const category  = getCategoryById(expense.category);

  const pressIn  = () => Animated.spring(scaleAnim, { toValue: 0.975, useNativeDriver: true, damping: 20, stiffness: 300 }).start();
  const pressOut = () => Animated.spring(scaleAnim, { toValue: 1,     useNativeDriver: true, damping: 16, stiffness: 200 }).start();

  const iconBg    = isDark ? category.darkColor : category.lightColor;
  const iconSize  = Math.min(width * 0.1, 44);
  const iconInner = iconSize * 0.47;
  const amtFont   = Math.min(width * 0.038, 15);
  const nameFont  = Math.min(width * 0.036, 14);
  const noteFont  = Math.min(width * 0.029, 11.5);
  const pad       = width < 380 ? 11 : 13;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginBottom: 5 }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={[s.row, {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          padding: pad,
          borderRadius: BorderRadius.lg,
        }]}
      >
        {/* Category icon */}
        <View style={[s.icon, {
          backgroundColor: iconBg,
          width: iconSize,
          height: iconSize,
          borderRadius: iconSize * 0.28,
        }]}>
          <MaterialIcons name={category.icon} size={iconInner} color={category.color} />
        </View>

        {/* Info block */}
        <View style={s.info}>
          <Text style={[s.name, { color: colors.text, fontSize: nameFont }]} numberOfLines={1}>
            {expense.name || category.name}
          </Text>

          {expense.note
            ? <Text style={[s.note, { color: colors.textSecondary, fontSize: noteFont }]} numberOfLines={1}>
                {truncateText(expense.note, 30)}
              </Text>
            : <Text style={[s.note, { color: colors.textTertiary, fontSize: noteFont }]} numberOfLines={1}>
                {category.name}
              </Text>
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
              style={[s.delBtn, { backgroundColor: colors.danger + '14' }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="close" size={13} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontWeight: FontWeight.semiBold,
    letterSpacing: -0.2,
  },
  note: {
    letterSpacing: 0.1,
  },
  time: {
    marginTop: 1,
  },
  right: {
    alignItems: 'flex-end',
    gap: 5,
    marginLeft: 10,
    flexShrink: 0,
  },
  amt: {
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  },
  delBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ExpenseItem;