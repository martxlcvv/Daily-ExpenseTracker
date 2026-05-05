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
  View,
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

const CURRENCY_SYMBOL = { PHP: '₱', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };

const AddExpenseScreen = ({ route, navigation }) => {
  const { addExpense, updateExpense, deleteExpense, getExpenseById, settings } = useExpenses();
  const { colors, isDark } = useTheme();

  const expenseId   = route?.params?.id;
  const routeExpense = route?.params?.expense || (expenseId ? getExpenseById(expenseId) : null);
  const mode        = route?.params?.mode || 'add';
  const isEdit      = mode === 'edit' && !!routeExpense;

  const [amount,          setAmount]          = useState('');
  const [category,        setCategory]        = useState('food');
  const [name,            setName]            = useState('');
  const [note,            setNote]            = useState('');
  const [date,            setDate]            = useState(new Date());
  const [showDatePicker,  setShowDatePicker]  = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [errors,          setErrors]          = useState({});

  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 320, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 320, useNativeDriver: true }),
    ]).start();

    if (isEdit && routeExpense) {
      setAmount(String(routeExpense.amount));
      setCategory(routeExpense.category || 'food');
      setName(routeExpense.name || '');
      setNote(routeExpense.note || '');
      setDate(routeExpense.date ? new Date(routeExpense.date) : new Date());
    }
  }, []);

  const validate = () => {
    const errs = {};
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) errs.amount = 'Enter a valid amount';
    if (parsed > 9_999_999)                       errs.amount = 'Amount is too large';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const getCatName = (catId) =>
    CATEGORIES.find((c) => c.id === catId)?.name || 'Expense';

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const expenseData = {
        amount:   parseFloat(amount),
        category,
        name:     name.trim() || getCatName(category),
        note:     note.trim(),
        date:     date.toISOString(),
      };

      if (isEdit && routeExpense) {
        await updateExpense(routeExpense.id, expenseData);
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
    if (!routeExpense) return;
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteExpense(routeExpense.id);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Error', 'Could not delete expense.');
          }
        },
      },
    ]);
  };

  const symbol = CURRENCY_SYMBOL[settings.currency] || settings.currency || '₱';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.separator }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.iconBtn, { backgroundColor: colors.surfaceSecondary }]}
          >
            <MaterialIcons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isEdit ? 'Edit Expense' : 'New Expense'}
          </Text>
          {isEdit ? (
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.iconBtn, { backgroundColor: '#FF525218' }]}
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
              {/* Amount */}
              <View
                style={[
                  styles.amountCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: errors.amount ? colors.danger : colors.primary + '50',
                    ...Shadow.md,
                    shadowColor: colors.shadow,
                  },
                ]}
              >
                <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>AMOUNT</Text>
                <View style={styles.amountRow}>
                  <Text style={[styles.currencySymbol, { color: colors.primary }]}>{symbol}</Text>
                  <Input
                    value={amount}
                    onChangeText={(v) => {
                      setAmount(v);
                      if (errors.amount) setErrors((p) => ({ ...p, amount: undefined }));
                    }}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    style={styles.amountInputWrap}
                    inputStyle={styles.amountInput}
                    autoCapitalize="none"
                  />
                </View>
                {errors.amount ? (
                  <Text style={[styles.errorMsg, { color: colors.danger }]}>{errors.amount}</Text>
                ) : null}
              </View>

              {/* Name */}
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Description</Text>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="What did you spend on?"
                icon="text-fields"
              />

              {/* Category */}
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Category</Text>
              <View style={styles.categoriesGrid}>
                {CATEGORIES.map((cat) => {
                  const sel = category === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setCategory(cat.id)}
                      style={[
                        styles.categoryItem,
                        {
                          backgroundColor: sel ? cat.color + '20' : colors.card,
                          borderColor:     sel ? cat.color        : colors.cardBorder,
                          borderWidth:     sel ? 2                : 1,
                          ...Shadow.sm,
                          shadowColor: colors.shadow,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.catIcon,
                          { backgroundColor: sel ? cat.color + '30' : isDark ? cat.darkColor : cat.lightColor },
                        ]}
                      >
                        <MaterialIcons
                          name={cat.icon}
                          size={24}
                          color={sel ? cat.color : cat.color + 'CC'}
                        />
                      </View>
                      <Text
                        style={[
                          styles.catName,
                          {
                            color:      sel ? cat.color        : colors.textSecondary,
                            fontWeight: sel ? FontWeight.semiBold : FontWeight.regular,
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

              {/* Date */}
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Date</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={[
                  styles.dateBtn,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
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
                  onChange={(_, selected) => {
                    setShowDatePicker(false);
                    if (selected) setDate(selected);
                  }}
                />
              )}

              <View style={{ height: Spacing.xl }} />

              <Button
                title={saving ? 'Saving…' : isEdit ? 'Update Expense' : 'Add Expense'}
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
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  scroll: { padding: Layout.screenPadding },
  amountCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    padding: Spacing['2xl'],
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currencySymbol: { fontSize: FontSize['3xl'], fontWeight: FontWeight.bold, marginRight: Spacing.xs },
  amountInputWrap: { flex: 1, marginBottom: 0 },
  amountInput: { fontSize: FontSize['4xl'], fontWeight: FontWeight.extraBold, textAlign: 'center', letterSpacing: -1 },
  errorMsg: { fontSize: FontSize.xs, marginTop: Spacing.xs },
  sectionLabel: { fontSize: FontSize.base, fontWeight: FontWeight.semiBold, marginBottom: Spacing.md },
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
  catName: { fontSize: FontSize.xs, textAlign: 'center', lineHeight: 14 },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  dateText: { flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.medium },
});

export default AddExpenseScreen;
