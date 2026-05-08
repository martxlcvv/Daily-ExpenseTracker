import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, Spacing } from '../theme/spacing';
import { FontSize, FontWeight } from '../theme/typography';
import { formatCurrency } from '../utils/formatters';

const BankAccountsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { bankAccounts, bankTotal, settings, addBankAccount, removeBankAccount } = useExpenses();
  const { width } = useWindowDimensions();
  const pad = width < 380 ? 16 : 20;

  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [balance, setBalance] = useState('');

  const handleAddAccount = useCallback(async () => {
    const amount = parseFloat(balance);
    if (!bankName.trim() || !accountName.trim()) {
      Alert.alert('Invalid', 'Enter bank name and account name.');
      return;
    }
    if (isNaN(amount) || amount < 0) {
      Alert.alert('Invalid Balance', 'Enter a valid account balance.');
      return;
    }

    await addBankAccount({
      bankName: bankName.trim(),
      accountName: accountName.trim(),
      accountNumber: accountNumber.trim(),
      balance: amount,
    });

    setBankName('');
    setAccountName('');
    setAccountNumber('');
    setBalance('');
  }, [bankName, accountName, accountNumber, balance, addBankAccount]);

  const handleRemove = async (id) => {
    Alert.alert('Remove Account', 'Are you sure you want to remove this bank account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await removeBankAccount(id);
        },
      },
    ]);
  };

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}> 
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={[s.header, { paddingHorizontal: pad, borderBottomColor: colors.separator }]}> 
          <TouchableOpacity onPress={() => navigation.goBack()} style={[s.backBtn, { backgroundColor: colors.surfaceSecondary }]}> 
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[s.title, { color: colors.text }]}>Bank Accounts</Text>
            <Text style={[s.subtitle, { color: colors.textSecondary }]}>Manage your accounts outside the wallet.</Text>
          </View>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={[s.scroll, { paddingHorizontal: pad }]}
            showsVerticalScrollIndicator={false}
          >
            <Card style={[s.summaryCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}> 
              <View style={s.summaryRow}>
                <View>
                  <Text style={[s.summaryLabel, { color: colors.textSecondary }]}>Total Bank Balance</Text>
                  <Text style={[s.summaryValue, { color: colors.text }]}>{formatCurrency(bankTotal, settings.currency)}</Text>
                </View>
                <View style={[s.badge, { backgroundColor: colors.surfaceSecondary }]}> 
                  <Text style={[s.badgeText, { color: colors.text }]}> {bankAccounts.length} account{bankAccounts.length !== 1 ? 's' : ''} </Text>
                </View>
              </View>
            </Card>

            <Text style={[s.sectionTitle, { color: colors.text }]}>Add New Bank Account</Text>
            <Card style={[s.formCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}> 
              <Input
                label="Bank Name"
                value={bankName}
                onChangeText={setBankName}
                placeholder="BPI, Metrobank, etc."
                icon="account-balance"
              />
              <Input
                label="Account Name"
                value={accountName}
                onChangeText={setAccountName}
                placeholder="My Savings Account"
                icon="badge"
              />
              <Input
                label="Account Number"
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholder="XXXX-XXXX-XXXX"
                icon="confirmation-number"
                keyboardType="number-pad"
                autoCapitalize="none"
              />
              <Input
                label="Balance"
                value={balance}
                onChangeText={setBalance}
                placeholder="0.00"
                icon="paid"
                keyboardType="decimal-pad"
              />
              <Button title="Add Bank Account" onPress={handleAddAccount} size="md" />
            </Card>

            <Text style={[s.sectionTitle, { color: colors.text }]}>Your Bank Accounts</Text>
            {bankAccounts.length === 0 ? (
              <Card style={[s.emptyCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.separator }]}> 
                <Text style={[s.emptyText, { color: colors.textSecondary }]}>Add a bank account to track funds outside your wallet.</Text>
              </Card>
            ) : bankAccounts.map((account) => (
              <Card key={account.id} style={[s.accountCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}> 
                <View style={s.accountHeader}>
                  <View style={s.accountTitleWrap}>
                    <Text style={[s.accountBank, { color: colors.text }]}>{account.bankName}</Text>
                    <Text style={[s.accountName, { color: colors.textSecondary }]}>{account.accountName}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemove(account.id)} style={s.removeBtn}>
                    <MaterialIcons name="delete-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
                <View style={s.accountFooter}>
                  <Text style={[s.accountBalance, { color: colors.text }]}>{formatCurrency(Number(account.balance) || 0, settings.currency)}</Text>
                  {account.accountNumber ? (
                    <Text style={[s.accountNumber, { color: colors.textSecondary }]}>•••• {account.accountNumber.slice(-4)}</Text>
                  ) : null}
                </View>
              </Card>
            ))}
            <View style={{ height: 80 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 14, paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
  },
  subtitle: {
    fontSize: FontSize.sm,
    marginTop: 4,
  },
  summaryCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  summaryLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  summaryValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginTop: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.lg,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
  },
  formCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  emptyCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  accountCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  accountTitleWrap: {
    flex: 1,
    gap: 4,
  },
  accountBank: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  accountName: {
    fontSize: FontSize.sm,
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountBalance: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  accountNumber: {
    fontSize: FontSize.xs,
  },
});

export default BankAccountsScreen;
