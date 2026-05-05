import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, Layout, Shadow, Spacing } from '../theme/spacing';
import { FontSize, FontWeight } from '../theme/typography';
import { CATEGORIES } from '../utils/categories';
import { formatDateFull } from '../utils/formatters';
import { ResponsiveSize } from '../utils/responsive';

const AddExpenseScreen = ({ route, navigation }) => {
  const { addExpense, updateExpense, getExpenseById } = useExpenses();
  const { colors, isDark } = useTheme();

  const expenseId = route?.params?.id;
  const mode = route?.params?.mode || 'add';
  const isEdit = mode === 'edit';

  const [amount, setAmount] = useState(isEdit ? String(expense.amount) : '');
  const [category, setCategory] = useState(isEdit ? expense.category : 'food');
  const [note, setNote] = useState(isEdit ? expense.note : '');
  const [date, setDate] = useState(isEdit ? new Date(expense.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = () => {
    const errs = {};
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      errs.amount = 'Please enter a valid amount';
    }
    if (parseFloat(amount) > 9999999) {
      errs.amount = 'Amount is too large';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const expenseData = {
        amount: parseFloat(amount),
        category,
        note: note.trim(),
        date: date.toISOString(),
      };
      if (isEdit) {
        await updateExpense(expense.id, expenseData);
      } else {
        await addExpense(expenseData);
      }
      navigation.goBack();
    } catch (e) {
      console.error('handleSave error:', e);
      Alert.alert('Error', 'Failed to save expense. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteExpense(expense.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const selectedCategory = CATEGORIES.find((c) => c.id === category);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.separator }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: colors.surfaceSecondary }]}
          >
            <MaterialIcons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isEdit ? 'Edit Expense' : 'New Expense'}
          </Text>
          {isEdit ? (
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.deleteBtn, { backgroundColor: '#FF525218' }]}
            >
              <MaterialIcons name="delete-outline" size={22} color={colors.danger} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
            >
              {/* Amount Input */}
              <View
                style={[
                  styles.amountCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: errors.amount ? colors.danger : colors.primary + '40',
                    ...Shadow.md,
                    shadowColor: colors.shadow,
                  },
                ]}
              >
                <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Amount</Text>
                <View style={styles.amountRow}>
                  <Text style={[styles.currencySymbol, { color: colors.primary }]}>
                    {settings.currency === 'PHP' ? '₱' : settings.currency === 'USD' ? '$' : settings.currency}
                  </Text>
                  <Input
                    value={amount}
                    onChangeText={(v) => {
                      setAmount(v);
                      if (errors.amount) setErrors({ ...errors, amount: undefined });
                    }}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    style={[styles.amountInputContainer]}
                    inputStyle={styles.amountInput}
                    error={errors.amount}
                    autoCapitalize="none"
                  />
                </View>
                {errors.amount && (
                  <Text style={[styles.errorMsg, { color: colors.danger }]}>{errors.amount}</Text>
                )}
              </View>

              {/* Category Selector */}
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Category</Text>
              <View style={styles.categoriesGrid}>
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setCategory(cat.id)}
                      style={[
                        styles.categoryItem,
                        {
                          backgroundColor: isSelected
                            ? cat.color + '20'
                            : colors.card,
                          borderColor: isSelected ? cat.color : colors.cardBorder,
                          borderWidth: isSelected ? 2 : 1,
                          ...Shadow.sm,
                          shadowColor: colors.shadow,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.catIcon,
                          {
                            backgroundColor: isSelected
                              ? cat.color + '30'
                              : isDark
                              ? cat.darkColor
                              : cat.lightColor,
                          },
                        ]}
                      >
                        <MaterialIcons
                          name={cat.icon}
                          size={24}
                          color={isSelected ? cat.color : isDark ? cat.color : cat.color + 'CC'}
                        />
                      </View>
                      <Text
                        style={[
                          styles.catName,
                          {
                            color: isSelected ? cat.color : colors.textSecondary,
                            fontWeight: isSelected ? FontWeight.semiBold : FontWeight.regular,
                          },
                        ]}
                        numberOfLines={2}
                      >
                        {cat.name.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Note */}
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Note</Text>
              <Input
                value={note}
                onChangeText={setNote}
                placeholder="Add a note (optional)"
                icon="notes"
                multiline
                numberOfLines={3}
                maxLength={200}
              />

              {/* Date Picker */}
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Date</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={[
                  styles.dateBtn,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <MaterialIcons name="event" size={20} color={colors.primary} />
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {formatDateFull(date)}
                </Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                />
              )}

              <View style={{ height: Spacing.xl }} />

              {/* Save Button */}
              <Button
                title={saving ? 'Saving...' : isEdit ? 'Update Expense' : 'Add Expense'}
                onPress={handleSave}
                loading={saving}
                size="lg"
              />

              <View style={{ height: Spacing['2xl'] }} />
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: Layout.screenPadding,
  },
  amountCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    padding: Spacing['2xl'],
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    marginRight: Spacing.xs,
  },
  amountInputContainer: {
    flex: 1,
    marginBottom: 0,
  },
  amountInput: {
    fontSize: FontSize['4xl'],
    fontWeight: FontWeight.extraBold,
    textAlign: 'center',
    letterSpacing: -1,
  },
  errorMsg: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
  },
  sectionLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    marginBottom: Spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: ResponsiveSize.isSmallScreen ? '23%' : '22%',
    minWidth: ResponsiveSize.isSmallScreen ? 60 : 70,
    borderRadius: BorderRadius.xl,
    padding: ResponsiveSize.isSmallScreen ? Spacing.sm : Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
    aspectRatio: 1,
    justifyContent: 'center',
  },
  catIcon: {
    width: ResponsiveSize.isSmallScreen ? 44 : 50,
    height: ResponsiveSize.isSmallScreen ? 44 : 50,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: {
    fontSize: ResponsiveSize.isSmallScreen ? FontSize.xs : FontSize.xs,
    textAlign: 'center',
    lineHeight: ResponsiveSize.isSmallScreen ? 12 : 14,
    fontWeight: FontWeight.medium,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  dateText: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
  },
});

export default AddExpenseScreen;