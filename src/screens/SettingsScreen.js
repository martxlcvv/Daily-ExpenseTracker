/**
 * SettingsScreen.js — Fixed
 * FIXES:
 *  1. KEYBOARD BUG: NameInput is now React.memo — parent re-renders from
 *     updateSettings() no longer unmount/remount the Input, so keyboard stays open.
 *  2. Profile card now shows avatar.png (squirrel) instead of hardcoded person icon.
 *  3. Minimalist profile card — cleaner layout.
 */
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
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

const CURRENCIES = [
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

// ── Avatar source (same path as UserAvatar.js) ────────────────────────────────
let AVATAR_SRC = null;
try {
  AVATAR_SRC = require('../../assets/avatar.png');
} catch {
  AVATAR_SRC = null;
}

// ── SettingRow ────────────────────────────────────────────────────────────────
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
        {subtitle ? (
          <Text style={[sr.sub, { color: colors.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={sr.right}>{right}</View>
    </TouchableOpacity>
  );
};

const sr = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, gap: 10 },
  icon:  { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  info:  { flex: 1, gap: 1 },
  label: { fontSize: 12, fontWeight: '500' },
  sub:   { fontSize: 10 },
  right: { alignItems: 'flex-end' },
});

// ── NameInput (MEMOIZED — KEY FIX for keyboard bug) ───────────────────────────
// Because this is React.memo, when the parent SettingsScreen re-renders after
// updateSettings(), this component does NOT re-render, so the Input keeps focus
// and the keyboard stays open.
const NameInput = React.memo(({ initialValue, onSave }) => {
  const { colors } = useTheme();
  const [value, setValue] = useState(initialValue);

  const doSave = useCallback(() => {
    if (value.trim()) onSave(value.trim());
  }, [value, onSave]);

  return (
    <View style={[ni.row, { padding: 12 }]}>
      <Input
        label="Display Name"
        value={value}
        onChangeText={setValue}
        placeholder="Your name"
        icon="person-outline"
        style={{ marginBottom: 0, flex: 1 }}
        returnKeyType="done"
        onSubmitEditing={doSave}
        blurOnSubmit={false}
      />
      <TouchableOpacity
        onPress={doSave}
        style={[ni.saveBtn, { backgroundColor: colors.primary }]}
      >
        <MaterialIcons name="check" size={15} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
});
NameInput.displayName = 'NameInput';

const ni = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  saveBtn: { width: 40, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});

// ── Need React import for React.memo ─────────────────────────────────────────
import React from 'react';

// ── Main ──────────────────────────────────────────────────────────────────────
const SettingsScreen = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { settings, updateSettings, clearAllExpenses } = useExpenses();
  const { width } = useWindowDimensions();
  const pad = width < 380 ? 14 : 18;

  const [notifEnabled,       setNotifEnabled]       = useState(settings.notificationsEnabled || false);
  const [budget,             setBudget]             = useState(String(settings.monthlyBudget || 15000));
  const [showBudgetInput,    setShowBudgetInput]    = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showWalletInput,    setShowWalletInput]    = useState(false);
  const [walletAmount,       setWalletAmount]       = useState(String(settings.walletBalance ?? 15000));
  const [hideWallet,         setHideWallet]         = useState(settings.hideWallet || false);
  const [notifHour,          setNotifHour]          = useState(String(settings.notifHour ?? 20));

  useEffect(() => {
    setWalletAmount(String(settings.walletBalance ?? 15000));
    setHideWallet(settings.hideWallet ?? false);
  }, [settings.walletBalance, settings.hideWallet]);

  // Stable callback for NameInput — won't change identity on every render
  const handleNameSave = useCallback(async (name) => {
    if (name && name !== settings.firstName) {
      await updateSettings('firstName', name);
    }
  }, [settings.firstName, updateSettings]);

  const handleNotifToggle = async (val) => {
    if (val) {
      const granted = await NotificationService.requestNotificationPermissions?.();
      if (!granted) {
        Alert.alert('Permission Required', 'Enable notifications in device settings.');
        return;
      }
      const hour = parseInt(notifHour, 10) || 20;
      await NotificationService.scheduleDailyReminder?.(hour, 0);
    } else {
      await NotificationService.cancelDailyReminder?.();
    }
    setNotifEnabled(val);
    await updateSettings('notificationsEnabled', val);
  };

  const handleNotifHourSave = async () => {
    const h = parseInt(notifHour, 10);
    if (isNaN(h) || h < 0 || h > 23) { Alert.alert('Invalid', 'Enter hour 0–23'); return; }
    await updateSettings('notifHour', h);
    if (notifEnabled) await NotificationService.scheduleDailyReminder?.(h, 0);
    Alert.alert('Saved', `Reminder set for ${h}:00`);
  };

  const handleBudgetSave = async () => {
    const val = parseFloat(budget);
    if (!val || val <= 0) { Alert.alert('Invalid Budget', 'Enter a valid amount.'); return; }
    await updateSettings('monthlyBudget', val);
    setShowBudgetInput(false);
  };

  const handleCurrencySelect = async (code) => {
    await updateSettings('currency', code);
    setShowCurrencyPicker(false);
  };

  const handleWalletSave = async () => {
    const value = Number(walletAmount);
    if (isNaN(value) || value < 0) { Alert.alert('Invalid Amount', 'Enter a valid wallet balance.'); return; }
    await updateSettings('walletBalance', value);
    setShowWalletInput(false);
    Alert.alert('Saved', `Wallet set to ${formatCurrency(value, settings.currency)}`);
  };

  const adjustWallet = (delta) => {
    const cur = Number(walletAmount) || 0;
    setWalletAmount(String(Math.max(0, cur + delta)));
  };

  const handleHideWalletToggle = async (val) => {
    setHideWallet(val);
    await updateSettings('hideWallet', val);
  };

  const handleClearData = () => {
    Alert.alert('Clear All Data', 'Permanently delete all expense records?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All', style: 'destructive',
        onPress: async () => {
          await clearAllExpenses();
          Alert.alert('Done', 'All expense data cleared.');
        },
      },
    ]);
  };

  const SectionHeader = ({ title }) => (
    <Text style={[s.secHdr, { color: colors.textSecondary, paddingHorizontal: pad }]}>{title}</Text>
  );
  const SectionCard = ({ children }) => (
    <Card style={[s.secCard, { marginHorizontal: 0 }]} elevation="sm">{children}</Card>
  );

  const currencyInfo = CURRENCIES.find((c) => c.code === settings.currency) || CURRENCIES[0];
  const displayName  = settings.firstName || 'User';

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

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={[s.scroll, { paddingHorizontal: pad }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          >

            {/* ── Profile card ── */}
            <LinearGradient
              colors={['#5A4FD1', '#7C75FF']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.profileCard}
            >
              {/* Avatar — shows squirrel if avatar.png exists, else initials */}
              <View style={s.profileAvatarWrap}>
                {AVATAR_SRC ? (
                  <Image
                    source={AVATAR_SRC}
                    style={{ width: 64, height: 64, borderRadius: 32 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={s.profileAvatarFallback}>
                    <Text style={s.profileAvatarInitials}>
                      {displayName.slice(0, 2).toUpperCase() || '💰'}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={s.profileName}>{displayName}</Text>
              <Text style={s.profileSub}>Daily Expense Tracker</Text>
              <Text style={s.profileVer}>v1.0.0</Text>
            </LinearGradient>

            {/* ── PERSONALIZATION ── */}
            <SectionHeader title="PERSONALIZATION" />
            <SectionCard>
              {/* ✅ KEYBOARD FIX: NameInput is memoized — won't re-render on parent update */}
              <NameInput
                initialValue={settings.firstName || ''}
                onSave={handleNameSave}
              />
            </SectionCard>

            {/* ── PREFERENCES ── */}
            <SectionHeader title="PREFERENCES" />
            <SectionCard>
              <SettingRow
                icon="dark-mode"
                label="Dark Mode"
                subtitle={isDark ? 'Enabled' : 'Disabled'}
                color="#7C75FF"
                right={
                  <Switch
                    value={isDark}
                    onValueChange={toggleTheme}
                    trackColor={{ true: '#7C75FF' }}
                    thumbColor={isDark ? '#FFF' : '#F4F3F4'}
                  />
                }
              />
              <SettingRow
                icon="payments"
                label="Currency"
                subtitle={`${currencyInfo.symbol} ${currencyInfo.name}`}
                color="#FFB347"
                onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
                right={
                  <MaterialIcons
                    name={showCurrencyPicker ? 'expand-less' : 'expand-more'}
                    size={18}
                    color={colors.textTertiary}
                  />
                }
                style={{ borderBottomWidth: showCurrencyPicker ? 1 : 0 }}
              />
              {showCurrencyPicker && (
                <View style={[s.picker, { borderTopColor: colors.separator }]}>
                  {CURRENCIES.map((cur) => (
                    <TouchableOpacity
                      key={cur.code}
                      onPress={() => handleCurrencySelect(cur.code)}
                      style={[
                        s.pickerOpt,
                        { backgroundColor: settings.currency === cur.code ? colors.primary + '15' : 'transparent' },
                      ]}
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

            {/* ── NOTIFICATIONS ── */}
            <SectionHeader title="NOTIFICATIONS" />
            <SectionCard>
              <SettingRow
                icon="notifications-none"
                label="Daily Reminders"
                subtitle={notifEnabled ? `Notified at ${settings.notifHour ?? 20}:00` : 'Reminders off'}
                color="#43D9AD"
                right={
                  <Switch
                    value={notifEnabled}
                    onValueChange={handleNotifToggle}
                    trackColor={{ true: '#43D9AD' }}
                    thumbColor={notifEnabled ? '#FFF' : '#F4F3F4'}
                  />
                }
              />
              {notifEnabled && (
                <View style={[s.inputWrap, { borderTopColor: colors.separator }]}>
                  <Text style={[s.inputLabel, { color: colors.textSecondary }]}>Reminder hour (0–23)</Text>
                  <View style={s.notifRow}>
                    <Input
                      value={notifHour}
                      onChangeText={setNotifHour}
                      keyboardType="number-pad"
                      placeholder="20"
                      style={{ flex: 1, marginBottom: 0 }}
                      blurOnSubmit={false}
                      maxLength={2}
                    />
                    <TouchableOpacity
                      onPress={handleNotifHourSave}
                      style={[s.saveBtn, { backgroundColor: colors.primary }]}
                    >
                      <MaterialIcons name="check" size={16} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </SectionCard>

            {/* ── WALLET ── */}
            <SectionHeader title="WALLET" />
            <SectionCard>
              <SettingRow
                icon="account-balance-wallet"
                label="Wallet Balance"
                subtitle={formatCurrency(settings.walletBalance || 0, settings.currency)}
                color="#43D9AD"
                onPress={() => setShowWalletInput(!showWalletInput)}
                right={
                  <MaterialIcons
                    name={showWalletInput ? 'expand-less' : 'expand-more'}
                    size={18}
                    color={colors.textTertiary}
                  />
                }
              />
              {showWalletInput && (
                <View style={[s.inputWrap, { borderTopColor: colors.separator }]}>
                  <View style={s.quickAdjust}>
                    {[-1000, -500, +500, +1000].map((delta) => (
                      <TouchableOpacity
                        key={delta}
                        onPress={() => adjustWallet(delta)}
                        style={[
                          s.adjBtn,
                          {
                            backgroundColor: delta < 0 ? '#FF525215' : '#43D9AD15',
                            borderColor:     delta < 0 ? '#FF5252'   : '#43D9AD',
                          },
                        ]}
                      >
                        <Text style={[s.adjBtnLabel, { color: delta < 0 ? '#FF5252' : '#43D9AD' }]}>
                          {delta > 0 ? '+' : ''}
                          {Math.abs(delta) >= 1000 ? (delta / 1000) + 'k' : delta}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Input
                    value={walletAmount}
                    onChangeText={setWalletAmount}
                    placeholder="Enter wallet amount"
                    keyboardType="decimal-pad"
                    prefix={currencyInfo.symbol}
                    style={{ marginBottom: Spacing.md }}
                    blurOnSubmit={false}
                  />
                  <Button title="Save Wallet" onPress={handleWalletSave} size="sm" />
                </View>
              )}
              <SettingRow
                icon="visibility"
                label="Hide Wallet Balance"
                subtitle={hideWallet ? 'Hidden on dashboard' : 'Visible on dashboard'}
                color="#7C75FF"
                right={
                  <Switch
                    value={hideWallet}
                    onValueChange={handleHideWalletToggle}
                    trackColor={{ true: colors.primary }}
                    thumbColor={hideWallet ? '#FFF' : '#F4F3F4'}
                  />
                }
                style={{ borderBottomWidth: 0 }}
              />
            </SectionCard>

            {/* ── SHOPPING LIST ── */}
            <SectionHeader title="SHOPPING LIST" />
            <SectionCard>
              <SettingRow
                icon="shopping-cart"
                label="Shopping List"
                subtitle={
                  settings.shoppingList?.length
                    ? `${settings.shoppingList.length} item(s)`
                    : 'Empty'
                }
                onPress={() => navigation.navigate('ShoppingList')}
                right={<MaterialIcons name="chevron-right" size={18} color={colors.textTertiary} />}
                style={{ borderBottomWidth: 0 }}
              />
            </SectionCard>

            {/* ── PLANNED PAYMENTS ── */}
            <SectionHeader title="PLANNED PAYMENTS" />
            <SectionCard>
              <SettingRow
                icon="event-note"
                label="Planned Payments"
                subtitle={
                  settings.plannedPayments?.length
                    ? `${settings.plannedPayments.length} payment(s)`
                    : 'None planned'
                }
                onPress={() => navigation.navigate('PlannedPayments')}
                right={<MaterialIcons name="chevron-right" size={18} color={colors.textTertiary} />}
                style={{ borderBottomWidth: 0 }}
              />
            </SectionCard>

            {/* ── BUDGET ── */}
            <SectionHeader title="BUDGET" />
            <SectionCard>
              <SettingRow
                icon="savings"
                label="Monthly Budget"
                subtitle={formatCurrency(settings.monthlyBudget || 15000, settings.currency)}
                color="#FF6584"
                onPress={() => setShowBudgetInput(!showBudgetInput)}
                right={
                  <MaterialIcons
                    name={showBudgetInput ? 'expand-less' : 'edit'}
                    size={18}
                    color={colors.textTertiary}
                  />
                }
                style={{ borderBottomWidth: showBudgetInput ? 1 : 0 }}
              />
              {showBudgetInput && (
                <View style={[s.inputWrap, { borderTopColor: colors.separator }]}>
                  <Input
                    value={budget}
                    onChangeText={setBudget}
                    placeholder="Enter monthly budget"
                    keyboardType="decimal-pad"
                    prefix={currencyInfo.symbol}
                    style={{ marginBottom: Spacing.md }}
                    blurOnSubmit={false}
                  />
                  <Button title="Save Budget" onPress={handleBudgetSave} size="sm" />
                </View>
              )}
            </SectionCard>

            {/* ── DATA ── */}
            <SectionHeader title="DATA" />
            <SectionCard>
              <SettingRow
                icon="history"
                label="Delete History"
                subtitle="View & restore deleted expenses"
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

            {/* ── ABOUT ── */}
            <SectionHeader title="ABOUT" />
            <SectionCard>
              <SettingRow icon="info-outline" label="App Version"  subtitle="v1.0.0 (Build 1)"                       color="#74B9FF" />
              <SettingRow icon="code"         label="Developed By" subtitle="Raymart"                                 color="#A29BFE" />
              <SettingRow icon="star-outline" label="Daily Ledger" subtitle="Track your expenses, reach your goals"  color="#FFE66D" style={{ borderBottomWidth: 0 }} />
            </SectionCard>

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
  scroll: { paddingTop: 8 },

  pageHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, marginBottom: 12,
  },
  backBtn:   { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold },

  profileCard: {
    borderRadius: 18, padding: 16,
    alignItems: 'center', marginBottom: 14, overflow: 'hidden', gap: 2,
  },
  profileAvatarWrap: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4, overflow: 'hidden',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
  },
  profileAvatarFallback: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  profileAvatarInitials: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  profileName: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  profileSub:  { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 0 },
  profileVer:  { fontSize: 9, color: 'rgba(255,255,255,0.4)',  marginTop: 0 },

  secHdr: {
    fontSize: FontSize.xs, fontWeight: '600', letterSpacing: 0.8,
    marginBottom: 3, marginTop: 2,
  },
  secCard: { marginBottom: 10, padding: 0, overflow: 'hidden' },

  picker:     { borderTopWidth: 1, paddingVertical: 4 },
  pickerOpt:  { flexDirection: 'row', alignItems: 'center', padding: 11, borderRadius: BorderRadius.md, marginHorizontal: 6, gap: 10 },
  pickerSym:  { fontSize: 17, fontWeight: '700', width: 26, textAlign: 'center' },
  pickerCode: { fontSize: 13, fontWeight: '600' },
  pickerName: { fontSize: 11 },

  inputWrap:  { padding: 12, borderTopWidth: 1 },
  inputLabel: { fontSize: FontSize.xs, fontWeight: '600', marginBottom: 7, letterSpacing: 0.3 },
  notifRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saveBtn:    { width: 44, height: 50, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  quickAdjust:  { flexDirection: 'row', gap: 7, marginBottom: Spacing.md },
  adjBtn:       { flex: 1, paddingVertical: 7, borderRadius: BorderRadius.sm, borderWidth: 1, alignItems: 'center' },
  adjBtnLabel:  { fontSize: 12, fontWeight: '700' },
});

export default SettingsScreen;