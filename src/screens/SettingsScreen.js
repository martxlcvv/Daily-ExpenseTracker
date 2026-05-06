import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
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
import NotificationService from '../services/NotificationService';
import { BorderRadius, Spacing } from '../theme/spacing';
import { FontSize, FontWeight } from '../theme/typography';
import { formatCurrency } from '../utils/formatters';

// Avatar image — place your image at assets/avatar.png
let AVATAR_SRC;
try { AVATAR_SRC = require('../../assets/avatar.png'); } catch { AVATAR_SRC = null; }

const CURRENCIES = [
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

// ── Reusable SettingRow ────────────────────────────────────────────────────────
const SettingRow = ({ icon, label, subtitle, right, onPress, color, style }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[sr.row, { borderBottomColor: colors.separator }, style]}
    >
      <View style={[sr.icon, { backgroundColor: (color || colors.primary) + '18' }]}>
        <MaterialIcons name={icon} size={18} color={color || colors.primary} />
      </View>
      <View style={sr.info}>
        <Text style={[sr.label, { color: colors.text }]}>{label}</Text>
        {subtitle ? <Text style={[sr.sub, { color: colors.textSecondary }]} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      <View style={sr.right}>{right}</View>
    </TouchableOpacity>
  );
};

const sr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  icon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 1 },
  label: { fontSize: 14, fontWeight: '500' },
  sub:   { fontSize: 12 },
  right: { alignItems: 'flex-end' },
});

// ── Main ──────────────────────────────────────────────────────────────────────
const SettingsScreen = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { settings, updateSettings, clearAllExpenses } = useExpenses();
  const { width } = useWindowDimensions();
  const pad = width < 380 ? 14 : 18;

  const [notifEnabled,      setNotifEnabled]      = useState(settings.notificationsEnabled || false);
  const [budget,            setBudget]            = useState(String(settings.monthlyBudget || 15000));
  const [showBudgetInput,   setShowBudgetInput]   = useState(false);
  const [showCurrencyPicker,setShowCurrencyPicker]= useState(false);
  const [showWalletInput,   setShowWalletInput]   = useState(false);
  const [walletAmount,      setWalletAmount]      = useState(String(settings.walletBalance || 15000));
  const [hideWallet,        setHideWallet]        = useState(settings.hideWallet || false);
  const [firstName,         setFirstName]         = useState(settings.firstName || '');

  useEffect(() => {
    setWalletAmount(String(settings.walletBalance ?? 15000));
    setHideWallet(settings.hideWallet ?? false);
  }, [settings.walletBalance, settings.hideWallet]);

  const handleNotifToggle = async (val) => {
    if (val) {
      const granted = await NotificationService.requestNotificationPermissions();
      if (!granted) {
        Alert.alert('Permission Required', 'Please enable notifications in device settings.');
        return;
      }
      await NotificationService.scheduleDailyReminder(20, 0);
    } else {
      await NotificationService.cancelDailyReminder();
    }
    setNotifEnabled(val);
    await updateSettings('notificationsEnabled', val);
  };

  const handleBudgetSave = async () => {
    const val = parseFloat(budget);
    if (!val || val <= 0) { Alert.alert('Invalid Budget', 'Enter a valid budget amount.'); return; }
    await updateSettings('monthlyBudget', val);
    setShowBudgetInput(false);
  };

  const handleNameSave = async () => {
    await updateSettings('firstName', firstName.trim());
    Alert.alert('Saved', 'Your name has been updated!');
  };

  const handleCurrencySelect = async (code) => {
    await updateSettings('currency', code);
    setShowCurrencyPicker(false);
  };

  const handleWalletSave = async () => {
    const value = Number(walletAmount);
    if (!value || value < 0) { Alert.alert('Invalid Amount', 'Enter a valid wallet balance.'); return; }
    await updateSettings('walletBalance', value);
    setShowWalletInput(false);
    Alert.alert('Saved', 'Wallet balance updated.');
  };

  const handleHideWalletToggle = async (val) => {
    setHideWallet(val);
    await updateSettings('hideWallet', val);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all expense records. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All', style: 'destructive',
          onPress: async () => {
            await clearAllExpenses();
            Alert.alert('Done', 'All expense data has been cleared.');
          },
        },
      ]
    );
  };

  const SectionHeader = ({ title }) => (
    <Text style={[s.secHdr, { color: colors.textSecondary, paddingHorizontal: pad }]}>{title}</Text>
  );

  const SectionCard = ({ children }) => (
    <Card style={[s.secCard, { marginHorizontal: 0 }]} elevation="sm">{children}</Card>
  );

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={s.safe} edges={['top']}>
        {/* Header */}
        <View style={[s.pageHeader, { paddingHorizontal: pad, borderBottomColor: colors.separator }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[s.backBtn, { backgroundColor: colors.surfaceSecondary }]}
          >
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[s.pageTitle, { color: colors.text }]}>Settings</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          contentContainerStyle={[s.scroll, { paddingHorizontal: pad }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile card */}
          <LinearGradient
            colors={['#6C63FF', '#8B85FF']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.profileCard}
          >
            {/* Avatar image */}
            <View style={s.profileAvatarWrap}>
              {AVATAR_SRC
                ? <Image source={AVATAR_SRC} style={s.profileAvatar} resizeMode="cover" />
                : <MaterialIcons name="person" size={36} color="#FFFFFF" />
              }
            </View>
            <Text style={s.profileName}>{settings.firstName || 'User'}</Text>
            <Text style={s.profileSub}>Daily Expense Tracker</Text>
            <Text style={s.profileVer}>v1.0.0</Text>
          </LinearGradient>

          {/* PERSONALIZATION */}
          <SectionHeader title="PERSONALIZATION" />
          <SectionCard>
            <View style={[s.nameRow, { padding: 14 }]}>
              <Input
                label="Display Name"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Your name"
                icon="person-outline"
                style={{ marginBottom: 0, flex: 1 }}
              />
              <TouchableOpacity
                onPress={handleNameSave}
                style={[s.saveBtn, { backgroundColor: colors.primary }]}
              >
                <MaterialIcons name="check" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </SectionCard>

          {/* PREFERENCES */}
          <SectionHeader title="PREFERENCES" />
          <SectionCard>
            <SettingRow
              icon="dark-mode"
              label="Dark Mode"
              subtitle={isDark ? 'Enabled' : 'Disabled'}
              color="#7C75FF"
              right={<Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: '#7C75FF' }} thumbColor={isDark ? '#FFF' : '#F4F3F4'} />}
            />
            <SettingRow
              icon="notifications-none"
              label="Daily Reminders"
              subtitle={notifEnabled ? 'Notified at 8:00 PM' : 'Reminders off'}
              color="#43D9AD"
              right={<Switch value={notifEnabled} onValueChange={handleNotifToggle} trackColor={{ true: '#43D9AD' }} thumbColor={notifEnabled ? '#FFF' : '#F4F3F4'} />}
            />
            <SettingRow
              icon="payments"
              label="Currency"
              subtitle={settings.currency || 'PHP'}
              color="#FFB347"
              onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
              right={<MaterialIcons name={showCurrencyPicker ? 'expand-less' : 'expand-more'} size={18} color={colors.textTertiary} />}
              style={{ borderBottomWidth: showCurrencyPicker ? 1 : 0 }}
            />
            {showCurrencyPicker && (
              <View style={[s.picker, { borderTopColor: colors.separator }]}>
                {CURRENCIES.map((cur) => (
                  <TouchableOpacity
                    key={cur.code}
                    onPress={() => handleCurrencySelect(cur.code)}
                    style={[s.pickerOpt, { backgroundColor: settings.currency === cur.code ? colors.primary + '15' : 'transparent' }]}
                  >
                    <Text style={[s.pickerSym, { color: colors.primary }]}>{cur.symbol}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.pickerCode, { color: colors.text }]}>{cur.code}</Text>
                      <Text style={[s.pickerName, { color: colors.textSecondary }]}>{cur.name}</Text>
                    </View>
                    {settings.currency === cur.code && (
                      <MaterialIcons name="check-circle" size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </SectionCard>

          {/* WALLET */}
          <SectionHeader title="WALLET" />
          <SectionCard>
            <SettingRow
              icon="account-balance-wallet"
              label="Wallet Balance"
              subtitle={formatCurrency(settings.walletBalance || 0, settings.currency)}
              color="#43D9AD"
              onPress={() => setShowWalletInput(!showWalletInput)}
              right={<MaterialIcons name={showWalletInput ? 'expand-less' : 'expand-more'} size={18} color={colors.textTertiary} />}
              style={{ borderBottomWidth: showWalletInput ? 1 : 1 }}
            />
            {showWalletInput && (
              <View style={[s.inputWrap, { borderTopColor: colors.separator }]}>
                <Input
                  value={walletAmount}
                  onChangeText={setWalletAmount}
                  placeholder="Enter wallet amount"
                  keyboardType="decimal-pad"
                  prefix={settings.currency === 'PHP' ? '₱' : '$'}
                  style={{ marginBottom: Spacing.md }}
                />
                <Button title="Save Wallet" onPress={handleWalletSave} size="sm" />
              </View>
            )}
            <SettingRow
              icon="visibility"
              label="Hide Wallet Balance"
              subtitle={hideWallet ? 'Hidden on dashboard' : 'Visible on dashboard'}
              color="#7C75FF"
              right={<Switch value={hideWallet} onValueChange={handleHideWalletToggle} trackColor={{ true: colors.primary }} thumbColor={hideWallet ? '#FFF' : '#F4F3F4'} />}
              style={{ borderBottomWidth: 0 }}
            />
          </SectionCard>

          {/* SHOPPING LIST */}
          <SectionHeader title="SHOPPING LIST" />
          <SectionCard>
            <SettingRow
              icon="shopping-cart"
              label="Shopping List"
              subtitle={settings.shoppingList?.length ? `${settings.shoppingList.length} item(s)` : 'Empty'}
              onPress={() => navigation.navigate('ShoppingList')}
              right={<MaterialIcons name="chevron-right" size={18} color={colors.textTertiary} />}
              style={{ borderBottomWidth: 0 }}
            />
          </SectionCard>

          {/* PLANNED PAYMENTS */}
          <SectionHeader title="PLANNED PAYMENTS" />
          <SectionCard>
            <SettingRow
              icon="event-note"
              label="Planned Payments"
              subtitle={settings.plannedPayments?.length ? `${settings.plannedPayments.length} payment(s)` : 'None planned'}
              onPress={() => navigation.navigate('PlannedPayments')}
              right={<MaterialIcons name="chevron-right" size={18} color={colors.textTertiary} />}
              style={{ borderBottomWidth: 0 }}
            />
          </SectionCard>

          {/* BUDGET */}
          <SectionHeader title="BUDGET" />
          <SectionCard>
            <SettingRow
              icon="account-balance-wallet"
              label="Monthly Budget"
              subtitle={formatCurrency(settings.monthlyBudget || 15000, settings.currency)}
              color="#FF6584"
              onPress={() => setShowBudgetInput(!showBudgetInput)}
              right={<MaterialIcons name={showBudgetInput ? 'expand-less' : 'edit'} size={18} color={colors.textTertiary} />}
              style={{ borderBottomWidth: showBudgetInput ? 1 : 0 }}
            />
            {showBudgetInput && (
              <View style={[s.inputWrap, { borderTopColor: colors.separator }]}>
                <Input
                  value={budget}
                  onChangeText={setBudget}
                  placeholder="Enter monthly budget"
                  keyboardType="decimal-pad"
                  prefix={settings.currency === 'PHP' ? '₱' : '$'}
                  style={{ marginBottom: Spacing.md }}
                />
                <Button title="Save Budget" onPress={handleBudgetSave} size="sm" />
              </View>
            )}
          </SectionCard>

          {/* DATA */}
          <SectionHeader title="DATA" />
          <SectionCard>
            <SettingRow
              icon="history"
              label="Delete History"
              subtitle="View and restore deleted expenses"
              color="#43D9AD"
              onPress={() => navigation.navigate('DeleteHistory')}
              right={<MaterialIcons name="chevron-right" size={18} color={colors.textTertiary} />}
            />
            <SettingRow
              icon="delete-forever"
              label="Clear All Data"
              subtitle="Permanently delete all expenses"
              color="#FF5252"
              onPress={handleClearData}
              right={<MaterialIcons name="chevron-right" size={18} color={colors.textTertiary} />}
              style={{ borderBottomWidth: 0 }}
            />
          </SectionCard>

          {/* ABOUT */}
          <SectionHeader title="ABOUT" />
          <SectionCard>
            <SettingRow icon="info-outline" label="App Version" subtitle="v1.0.0 (Build 1)" color="#74B9FF" />
            <SettingRow icon="code" label="Developed By" subtitle="Raymart" color="#A29BFE" />
            <SettingRow
              icon="star-outline"
              label="Daily Ledger"
              subtitle="Track your expenses, reach your goals"
              color="#FFE66D"
              style={{ borderBottomWidth: 0 }}
            />
          </SectionCard>

          <View style={{ height: 80 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 8 },

  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold },

  profileCard: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    overflow: 'hidden',
    gap: 4,
  },
  profileAvatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  profileAvatar: { width: 72, height: 72, borderRadius: 36 },
  profileName: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  profileSub:  { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  profileVer:  { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 },

  secHdr: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 4,
  },
  secCard: {
    marginBottom: Spacing.xl,
    padding: 0,
    overflow: 'hidden',
  },

  nameRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  saveBtn: {
    width: 44,
    height: 50,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  picker: { borderTopWidth: 1, paddingVertical: 6 },
  pickerOpt: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.md,
    marginHorizontal: 8,
    gap: 12,
  },
  pickerSym:  { fontSize: 18, fontWeight: '700', width: 28, textAlign: 'center' },
  pickerCode: { fontSize: 14, fontWeight: '600' },
  pickerName: { fontSize: 12 },

  inputWrap: { padding: 14, borderTopWidth: 1 },
});

export default SettingsScreen;