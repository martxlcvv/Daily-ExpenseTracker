import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Layout, Spacing } from '../../theme/spacing';
import { FontSize, FontWeight } from '../../theme/typography';
import { CATEGORIES, getCategoryById } from '../../utils/categories';
import { formatDateFull } from '../../utils/formatters';
import { ResponsiveSize } from '../../utils/responsive';
import Button from '../common/Button';
import Input from '../common/Input';

const currencySymbols = {
  PHP: '₱',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

const ExpenseForm = ({
  expense,
  currency = 'PHP',
  onSubmit,
  onDelete,
  onCancel,
  loading = false,
  submitLabel,
}) => {
  const { colors, isDark } = useTheme();
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
  const [category, setCategory] = useState(expense ? expense.category : CATEGORIES[0].id);
  const [note, setNote] = useState(expense ? expense.note : '');
  const [date, setDate] = useState(expense ? new Date(expense.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (expense) {
      setAmount(String(expense.amount));
      setCategory(expense.category);
      setNote(expense.note || '');
      setDate(new Date(expense.date));
    }
  }, [expense]);

  const selectedCategory = useMemo(() => getCategoryById(category), [category]);
  const symbol = currencySymbols[currency] || currency;

  const validate = () => {
    const newErrors = {};

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (parseFloat(amount) > 9999999) {
      newErrors.amount = 'Amount is too large';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit?.({
      amount: parseFloat(amount),
      category,
      note: note.trim(),
      date: date.toISOString(),
    });
  };

  const handleDelete = () => {
    if (!expense || !onDelete) return;
    onDelete(expense.id);
  };

  const handleDateChange = (_, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.wrapper}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Amount</Text>
          <Input
            value={amount}
            onChangeText={(value) => {
              setAmount(value);
              if (errors.amount) setErrors({ ...errors, amount: undefined });
            }}
            placeholder="0.00"
            keyboardType="decimal-pad"
            prefix={symbol}
            error={errors.amount}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((item) => {
              const selected = item.id === category;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setCategory(item.id)}
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor: selected ? item.color + '22' : colors.surface,
                      borderColor: selected ? item.color : colors.cardBorder,
                    },
                  ]}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: isDark ? item.darkColor : item.lightColor }]}> 
                    <MaterialIcons name={item.icon} size={24} color={item.color} />
                  </View>
                  <Text style={[styles.categoryLabel, { color: selected ? item.color : colors.text }]} numberOfLines={2}>
                    {item.name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Note</Text>
          <Input
            label="Optional"
            value={note}
            onChangeText={setNote}
            placeholder="What was this for?"
            multiline
            numberOfLines={4}
            inputStyle={styles.noteInput}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Date</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={[styles.dateButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.cardBorder }]}
          >
            <View style={styles.dateLabelRow}>
              <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
              <Text style={[styles.dateText, { color: colors.text }]}>{formatDateFull(date)}</Text>
            </View>
            <MaterialIcons name="keyboard-arrow-down" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.footer}> 
          <Button
            title={submitLabel || (expense ? 'Update Expense' : 'Save Expense')}
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
          />
          {onCancel && (
            <Button
              title="Cancel"
              variant="ghost"
              onPress={onCancel}
              disabled={loading}
              style={styles.cancelButton}
            />
          )}
          {expense && onDelete && (
            <Button
              title="Delete"
              variant="danger"
              onPress={handleDelete}
              disabled={loading}
              style={styles.deleteButton}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    padding: Layout.screenPadding,
    paddingBottom: Spacing['3xl'],
  },
  section: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    marginBottom: Spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: ResponsiveSize.isSmallScreen ? '23%' : '22%',
    minWidth: ResponsiveSize.isSmallScreen ? 60 : 65,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    justifyContent: 'center',
    aspectRatio: 1,
  },
  categoryIcon: {
    width: ResponsiveSize.isSmallScreen ? 44 : 48,
    height: ResponsiveSize.isSmallScreen ? 44 : 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  categoryLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    textAlign: 'center',
  },
  noteInput: {
    minHeight: 110,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  dateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dateText: {
    fontSize: FontSize.base,
    marginLeft: Spacing.xs,
  },
  footer: {
    gap: Spacing.sm,
  },
  cancelButton: {
    marginTop: Spacing.sm,
  },
  deleteButton: {
    marginTop: Spacing.sm,
  },
});

export default ExpenseForm;
