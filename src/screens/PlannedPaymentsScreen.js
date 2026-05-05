import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, Layout, Spacing } from '../theme/spacing';
import { FontSize, FontWeight } from '../theme/typography';
import { formatCurrency } from '../utils/formatters';

export default function PlannedPaymentsScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { settings, addPlannedPayment, removePlannedPayment } = useExpenses();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleAddPayment = async () => {
    const parsedAmount = Number(amount);
    if (!title.trim() || !parsedAmount || parsedAmount <= 0) {
      Alert.alert('Add Payment', 'Please enter a valid title and amount.');
      return;
    }

    await addPlannedPayment({
      title: title.trim(),
      amount: parsedAmount,
      dueDate: dueDate.trim() || 'No date',
    });

    setTitle('');
    setAmount('');
    setDueDate('');
  };

  const handleRemovePayment = (paymentId) => {
    removePlannedPayment(paymentId);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}> 
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}> 
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}> 
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Planned Payments</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card style={styles.card} elevation="sm"> 
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Add planned payment</Text>
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder="Payment title"
              icon="event-note"
              style={{ marginBottom: Spacing.md }}
            />
            <Input
              value={amount}
              onChangeText={setAmount}
              placeholder="Amount"
              keyboardType="decimal-pad"
              icon="attach-money"
              prefix="₱"
              style={{ marginBottom: Spacing.md }}
            />
            <Input
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="Due date (optional)"
              icon="calendar-today"
            />
            <Button title="Add Payment" onPress={handleAddPayment} style={styles.submitButton} />
          </Card>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Upcoming payments</Text>
          {(settings.plannedPayments || []).length ? (
            (settings.plannedPayments || []).map((payment) => (
              <Card key={payment.id} style={styles.itemCard} elevation="sm"> 
                <View style={styles.itemRow}>
                  <View style={styles.paymentInfo}>
                    <Text style={[styles.itemText, { color: colors.text }]}>{payment.title}</Text>
                    <Text style={[styles.paymentSub, { color: colors.textSecondary }]}>
                      {formatCurrency(payment.amount, settings.currency)} • {payment.dueDate || 'No date'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemovePayment(payment.id)}>
                    <MaterialIcons name="delete" size={22} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No planned payments yet.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: Layout.screenPadding },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  card: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    marginBottom: Spacing.sm,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  itemCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentInfo: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  itemText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
  },
  paymentSub: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
  },
  emptyText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
