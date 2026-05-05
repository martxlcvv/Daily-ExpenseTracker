import { MaterialIcons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing } from '../../theme/spacing';
import { FontSize, FontWeight } from '../../theme/typography';
import { getCategoryById } from '../../utils/categories';
import { formatCurrency, formatTime, truncateText } from '../../utils/formatters';

const ExpenseItem = ({ expense, onPress, onDelete, currency = 'PHP' }) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const category = getCategoryById(expense.category);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };

  const iconBg = isDark ? category.darkColor : category.lightColor;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        {/* Category Icon */}
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <MaterialIcons name={category.icon} size={22} color={category.color} />
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={1}>
            {category.name}
          </Text>
          {expense.note ? (
            <Text style={[styles.note, { color: colors.textSecondary }]} numberOfLines={1}>
              {truncateText(expense.note, 35)}
            </Text>
          ) : (
            <Text style={[styles.note, { color: colors.textTertiary }]}>No note</Text>
          )}
          <Text style={[styles.time, { color: colors.textTertiary }]}>
            {formatTime(expense.date)}
          </Text>
        </View>

        {/* Amount + Delete */}
        <View style={styles.rightSection}>
          <Text style={[styles.amount, { color: colors.text }]}>
            {formatCurrency(expense.amount, currency)}
          </Text>
          {onDelete && (
            <TouchableOpacity
              onPress={() => onDelete(expense.id)}
              style={[styles.deleteBtn, { backgroundColor: colors.surfaceSecondary }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="delete-outline" size={16} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  categoryName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
  },
  note: {
    fontSize: FontSize.sm,
  },
  time: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  amount: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ExpenseItem;