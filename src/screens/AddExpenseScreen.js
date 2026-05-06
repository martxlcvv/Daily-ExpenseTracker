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
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, Shadow, Spacing } from '../theme/spacing';
import { FontSize, FontWeight } from '../theme/typography';
import { CATEGORIES } from '../utils/categories';
import { formatDateFull } from '../utils/formatters';

const CURRENCY_SYMBOL = { PHP: '₱', USD: '$', EUR: '€', GBP: '£', JPY: '¥' };

const AddExpenseScreen = ({ route, navigation }) => {
  const { addExpense, updateExpense, deleteExpense, getExpenseById, settings } = useExpenses();
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();

  const pad = width < 380 ? 14 : 18;

  const expenseId    = route?.params?.id;
  const routeExpense = route?.params?.expense || (expenseId ? getExpenseById(expenseId) : null);
  const mode         = route?.params?.mode || 'add';
  const isEdit       = mode === 'edit' && !!routeExpense;

  const [amount,         setAmount]         = useState('');
  const [category,       setCategory]       = useState('food');
  const [name,           setName]           = useState('');
  const [note,           setNote]           = useState('');
  const [date,           setDate]           = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [errors,         setErrors]         = useState({});

  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 280, useNativeDriver: true }),
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
    const p = parseFloat(amount);
    if (!amount || isNaN(p) || p <= 0) errs.amount = 'Enter a valid amount';
    if (p > 9_999_999)                  errs.amount = 'Amount too large';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const getCatName = (catId) => CATEGORIES.find((c) => c.id === catId)?.name || 'Expense';

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
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteExpense(routeExpense.id);
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Could not delete expense.');
          }
        },
      },
    ]);
  };

  const symbol = CURRENCY_SYMBOL[settings.currency] || '₱';

  // Responsive category grid: 4 or 5 per row
  const cols = width < 360 ? 4 : 5;
  const itemGap = 8;
  const catItemSize = (width - pad * 2 - itemGap * (cols - 1)) / cols;

  const amtFontSize   = Math.min(width * 0.1, 40);
  const symFontSize   = Math.min(width * 0.07, 28);

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={s.safe} edges={['top']}>
        {/* Header */}
        <View style={[s.header, { paddingHorizontal: pad, borderBottomColor: colors.separator }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[s.iconBtn, { backgroundColor: colors.surfaceSecondary }]}
          >
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: colors.text }]}>
            {isEdit ? 'Edit Expense' : 'New Expense'}
          </Text>
          {isEdit ? (
            <TouchableOpacity
              onPress={handleDelete}
              style={[s.iconBtn, { backgroundColor: '#FF525215' }]}
            >
              <MaterialIcons name="delete-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
          ) : <View style={{ width: 38 }} />}
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={[s.scroll, { paddingHorizontal: pad }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

              {/* Amount Card */}
              <View style={[s.amtCard, {
                backgroundColor: colors.card,
                borderColor: errors.amount ? colors.danger : colors.primary + '40',
                ...Shadow.md,
                shadowColor: colors.shadow,
              }]}>
                <Text style={[s.amtLabel, { color: colors.textSecondary }]}>AMOUNT</Text>
                <View style={s.amtRow}>
                  <Text style={[s.symText, { color: colors.primary, fontSize: symFontSize }]}>{symbol}</Text>
                  <Input
                    value={amount}
                    onChangeText={(v) => { setAmount(v); if (errors.amount) setErrors({}); }}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    style={s.amtInputWrap}
                    inputStyle={[s.amtInput, { fontSize: amtFontSize, color: colors.text }]}
                    autoCapitalize="none"
                  />
                </View>
                {errors.amount ? <Text style={[s.errMsg, { color: colors.danger }]}>{errors.amount}</Text> : null}
              </View>

              {/* Description */}
              <Text style={[s.secLabel, { color: colors.text }]}>Description</Text>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="What did you spend on?"
                icon="text-fields"
              />

              {/* Category */}
              <Text style={[s.secLabel, { color: colors.text }]}>Category</Text>
              <View style={[s.catGrid, { marginBottom: Spacing.xl, gap: itemGap }]}>
                {CATEGORIES.map((cat) => {
                  const sel = category === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setCategory(cat.id)}
                      style={[s.catItem, {
                        width: catItemSize,
                        height: catItemSize,
                        backgroundColor: sel ? cat.color + '20' : colors.card,
                        borderColor:     sel ? cat.color        : colors.cardBorder,
                        borderWidth:     sel ? 2                : 1,
                      }]}
                    >
                      <View style={[s.catIcon, { backgroundColor: sel ? cat.color + '28' : isDark ? cat.darkColor : cat.lightColor }]}>
                        <MaterialIcons name={cat.icon} size={Math.min(catItemSize * 0.38, 22)} color={cat.color} />
                      </View>
                      <Text style={[s.catName, {
                        color:     sel ? cat.color : colors.textSecondary,
                        fontWeight: sel ? '600'    : '400',
                        fontSize:  Math.min(catItemSize * 0.22, 11),
                      }]} numberOfLines={1}>
                        {cat.name.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Note */}
              <Text style={[s.secLabel, { color: colors.text }]}>Note</Text>
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
              <Text style={[s.secLabel, { color: colors.text }]}>Date</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={[s.dateBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              >
                <MaterialIcons name="event" size={18} color={colors.primary} />
                <Text style={[s.dateText, { color: colors.text, flex: 1 }]}>{formatDateFull(date)}</Text>
                <MaterialIcons name="chevron-right" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={(_, selected) => { setShowDatePicker(false); if (selected) setDate(selected); }}
                />
              )}

              <View style={{ height: Spacing.xl }} />

              <Button
                title={saving ? 'Saving…' : isEdit ? 'Update Expense' : 'Add Expense'}
                onPress={handleSave}
                loading={saving}
                size="lg"
              />
              <View style={{ height: 32 }} />
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  scroll: { paddingTop: 16 },

  amtCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  amtLabel: { fontSize: FontSize.xs, fontWeight: '600', letterSpacing: 1, marginBottom: Spacing.sm },
  amtRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  symText:  { fontWeight: '700' },
  amtInputWrap: { flex: 1, marginBottom: 0 },
  amtInput: { fontWeight: '800', textAlign: 'center', letterSpacing: -1 },
  errMsg:   { fontSize: FontSize.xs, marginTop: 4 },

  secLabel: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.sm },

  catGrid:  { flexDirection: 'row', flexWrap: 'wrap' },
  catItem:  { borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center', gap: 4 },
  catIcon:  { width: '60%', aspectRatio: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  catName:  { textAlign: 'center' },

  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  dateText: { fontSize: FontSize.base, fontWeight: '500' },
});

export default AddExpenseScreen;