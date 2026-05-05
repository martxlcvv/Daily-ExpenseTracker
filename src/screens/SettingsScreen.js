import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import UserAvatar from '../components/UserAvatar';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import NotificationService from '../services/NotificationService';
import { BorderRadius, Layout, Spacing } from '../theme/spacing';
import { FontSize, FontWeight } from '../theme/typography';
import { formatCurrency } from '../utils/formatters';

const CURRENCIES = [
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

const MASCOTS = [
  { id: 'squirrel', emoji: '🐿️', name: 'Squirrel' },
  { id: 'rocket', emoji: '🚀', name: 'Rocket' },
  { id: 'star', emoji: '⭐', name: 'Star' },
  { id: 'heart', emoji: '💖', name: 'Heart' },
  { id: 'smile', emoji: '😊', name: 'Smile' },
];

const SettingRow = ({ icon, label, subtitle, right, onPress, color, style }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[styles.settingRow, { borderBottomColor: colors.separator }, style]}
    >
      <View style={[styles.settingIcon, { backgroundColor: (color || colors.primary) + '18' }]}>
        <MaterialIcons name={icon} size={20} color={color || colors.primary} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        )}
      </View>
      <View style={styles.settingRight}>{right}</View>
    </TouchableOpacity>
  );
};

const SettingsScreen = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { settings, updateSettings, clearAllExpenses } = useExpenses();
  const [notifEnabled, setNotifEnabled] = useState(settings.notificationsEnabled || false);
  const [budget, setBudget] = useState(String(settings.monthlyBudget || 15000));
  const [showBudgetInput, setShowBudgetInput] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showMascotPicker, setShowMascotPicker] = useState(false);
  const [showWalletInput, setShowWalletInput] = useState(false);
  const [walletAmount, setWalletAmount] = useState(String(settings.walletBalance || 15000));
  const [hideWallet, setHideWallet] = useState(settings.hideWallet || false);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(0);
  const [firstName, setFirstName] = useState(settings.firstName || '');
  const [selectedMascot, setSelectedMascot] = useState(settings.mascotType || 'squirrel');
  const [avatarImage, setAvatarImage] = useState(settings.avatarImage || null);
  const [avatarVoice, setAvatarVoice] = useState(settings.avatarVoice || false);

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
    if (!val || val <= 0) {
      Alert.alert('Invalid Budget', 'Please enter a valid budget amount.');
      return;
    }
    await updateSettings('monthlyBudget', val);
    setShowBudgetInput(false);
  };

  const handleNameSave = async () => {
    await updateSettings('firstName', firstName);
    Alert.alert('Saved', 'Your name has been updated!');
  };

  const handleMascotSelect = async (mascotId) => {
    setSelectedMascot(mascotId);
    await updateSettings('mascotType', mascotId);
    setAvatarImage(null); // Clear custom image when selecting mascot
    await updateSettings('avatarImage', null);
  };

  const handlePickAvatarImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        const imageUri = result.assets[0].uri;
        setAvatarImage(imageUri);
        await updateSettings('avatarImage', imageUri);
        Alert.alert('Success', 'Avatar image updated!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('Image picker error:', error);
    }
  };

  const handleRemoveAvatarImage = async () => {
    setAvatarImage(null);
    await updateSettings('avatarImage', null);
    Alert.alert('Success', 'Avatar image removed!');
  };

  const handleAvatarVoiceToggle = async (val) => {
    setAvatarVoice(val);
    await updateSettings('avatarVoice', val);
  };

  const handleCurrencySelect = async (code) => {
    await updateSettings('currency', code);
    setShowCurrencyPicker(false);
  };

  const handleWalletSave = async () => {
    const value = Number(walletAmount);
    if (!value || value < 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid wallet balance.');
      return;
    }
    await updateSettings('walletBalance', value);
    setShowWalletInput(false);
    Alert.alert('Saved', 'Wallet balance updated.');
  };

  const handleHideWalletToggle = async (val) => {
    setHideWallet(val);
    await updateSettings('hideWallet', val);
  };


  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert('Feedback', 'Please write your message first.');
      return;
    }
    await updateSettings('feedbackEntries', [
      { id: `${Date.now()}`, message: feedbackText.trim(), rating, submittedAt: new Date().toISOString() },
      ...(settings.feedbackEntries || []),
    ]);
    setFeedbackText('');
    setRating(0);
    Alert.alert('Thank you!', 'Your feedback has been recorded.');
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your expense records. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearAllExpenses();
            Alert.alert('Done', 'All expense data has been cleared.');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Profile Card */}
          <View style={styles.avatarWrapper}>
            <UserAvatar 
              userName={settings.firstName || 'User'} 
              mascotType={selectedMascot}
              customImageUri={avatarImage}
              size="md"
            />
          </View>

          {/* Mascot Selection */}
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>CUSTOMIZE AVATAR</Text>
          <Card style={styles.sectionCard} elevation="sm">
            <View style={styles.mascotGrid}>
              {MASCOTS.map((mascot) => (
                <TouchableOpacity
                  key={mascot.id}
                  onPress={() => handleMascotSelect(mascot.id)}
                  style={[
                    styles.mascotItem,
                    {
                      backgroundColor:
                        selectedMascot === mascot.id
                          ? colors.primary + '20'
                          : colors.surface,
                      borderColor:
                        selectedMascot === mascot.id
                          ? colors.primary
                          : colors.border,
                      borderWidth: selectedMascot === mascot.id ? 2 : 1,
                    },
                  ]}
                >
                  <Text style={styles.mascotEmoji}>{mascot.emoji}</Text>
                  <Text
                    style={[
                      styles.mascotName,
                      { color: selectedMascot === mascot.id ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    {mascot.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Custom Avatar Image */}
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>CUSTOM AVATAR IMAGE</Text>
          <Card style={styles.sectionCard} elevation="sm">
            <SettingRow
              icon="image"
              label="Upload Avatar Photo"
              subtitle={avatarImage ? 'Custom image set' : 'Use your own photo'}
              color="#FF6B9D"
              onPress={handlePickAvatarImage}
              right={<MaterialIcons name="image" size={20} color={colors.primary} />}
            />
            {avatarImage && (
              <SettingRow
                icon="delete"
                label="Remove Custom Image"
                subtitle="Back to emoji mascots"
                color="#FF5252"
                onPress={handleRemoveAvatarImage}
                right={<MaterialIcons name="delete" size={20} color="#FF5252" />}
                style={{ borderBottomWidth: 0 }}
              />
            )}
          </Card>

          {/* Avatar Voice Settings */}
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>AVATAR VOICE</Text>
          <Card style={styles.sectionCard} elevation="sm">
            <SettingRow
              icon="volume-up"
              label="Avatar Voice"
              subtitle={avatarVoice ? 'Avatar will greet you when app opens' : 'Voice is off'}
              color="#00C9FF"
              right={<Switch value={avatarVoice} onValueChange={handleAvatarVoiceToggle} trackColor={{ true: '#00C9FF' }} />}
              style={{ borderBottomWidth: 0 }}
            />
          </Card>

          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>APP THEME</Text>
          <Card style={styles.sectionCard} elevation="sm">
            <SettingRow
              icon="dark-mode"
              label="Dark Mode"
              subtitle={isDark ? 'Enabled' : 'Disabled'}
              color="#7C75FF"
              right={<Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: '#7C75FF' }} />}
              style={{ borderBottomWidth: 0 }}
            />
          </Card>

          {/* Profile Card */}
          <LinearGradient
            colors={['#6C63FF', '#8B85FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <View style={styles.avatarLarge}>
              <MaterialIcons name="person" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.profileName}>{settings.firstName || 'User'}</Text>
            <Text style={styles.profileSub}>Daily Expense Tracker</Text>
            <Text style={styles.profileVersion}>v1.0.0</Text>
          </LinearGradient>

          {/* Personalization */}
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>PERSONALIZATION</Text>
          <Card style={styles.sectionCard} elevation="sm">
            <View style={styles.nameRow}>
              <Input
                label="Display Name"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Your name"
                icon="person-outline"
                style={{ marginBottom: 0 }}
              />
              <TouchableOpacity
                onPress={handleNameSave}
                style={[styles.saveNameBtn, { backgroundColor: colors.primary }]}
              >
                <MaterialIcons name="check" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Card>

          {/* Preferences */}
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>PREFERENCES</Text>
          <Card style={styles.sectionCard} elevation="sm">
            <SettingRow
              icon="dark-mode"
              label="Dark Mode"
              subtitle={isDark ? 'Currently dark theme' : 'Currently light theme'}
              color="#6C63FF"
              right={<Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: '#6C63FF' }} />}
            />
            <SettingRow
              icon="notifications-none"
              label="Daily Reminders"
              subtitle={notifEnabled ? 'Notified at 8:00 PM daily' : 'Reminders are off'}
              color="#43D9AD"
              right={<Switch value={notifEnabled} onValueChange={handleNotifToggle} trackColor={{ true: '#43D9AD' }} />}
            />
            <SettingRow
              icon="payments"
              label="Currency"
              subtitle={settings.currency || 'PHP'}
              color="#FFB347"
              onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
              right={
                <MaterialIcons
                  name={showCurrencyPicker ? 'expand-less' : 'expand-more'}
                  size={20}
                  color={colors.textTertiary}
                />
              }
            />
            {showCurrencyPicker && (
              <View style={[styles.currencyPicker, { borderTopColor: colors.separator }]}>
                {CURRENCIES.map((cur) => (
                  <TouchableOpacity
                    key={cur.code}
                    onPress={() => handleCurrencySelect(cur.code)}
                    style={[
                      styles.currencyOption,
                      {
                        backgroundColor:
                          settings.currency === cur.code ? colors.primary + '18' : 'transparent',
                      },
                    ]}
                  >
                    <Text style={[styles.currencySymbol, { color: colors.primary }]}>{cur.symbol}</Text>
                    <View>
                      <Text style={[styles.currencyCode, { color: colors.text }]}>{cur.code}</Text>
                      <Text style={[styles.currencyName, { color: colors.textSecondary }]}>{cur.name}</Text>
                    </View>
                    {settings.currency === cur.code && (
                      <MaterialIcons name="check-circle" size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>

          {/* Wallet */}
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>WALLET</Text>
          <Card style={styles.sectionCard} elevation="sm">
            <SettingRow
              icon="account-balance-wallet"
              label="Wallet Balance"
              subtitle={formatCurrency(settings.walletBalance || 0, settings.currency)}
              color="#43D9AD"
              onPress={() => setShowWalletInput(!showWalletInput)}
              right={
                <MaterialIcons
                  name={showWalletInput ? 'expand-less' : 'expand-more'}
                  size={20}
                  color={colors.textTertiary}
                />
              }
            />
            {showWalletInput && (
              <View style={[styles.budgetInput, { borderTopColor: colors.separator }]}>
                <Input
                  value={walletAmount}
                  onChangeText={setWalletAmount}
                  placeholder="Enter wallet amount"
                  keyboardType="decimal-pad"
                  icon="wallet"
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
              right={
                <Switch
                  value={hideWallet}
                  onValueChange={handleHideWalletToggle}
                  trackColor={{ true: colors.primary }}
                />
              }
              style={{ borderBottomWidth: 0 }}
            />
          </Card>

          {/* Shopping List */}
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>SHOPPING LIST</Text>
          <Card style={styles.sectionCard} elevation="sm">
            <SettingRow
              icon="shopping-cart"
              label="Shopping List"
              subtitle={
                settings.shoppingList?.length
                  ? `${settings.shoppingList.length} item(s) saved`
                  : 'No shopping items yet'
              }
              onPress={() => navigation.navigate('ShoppingList')}
              right={<MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />}
            />
          </Card>

          {/* Planned Payments */}
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>PLANNED PAYMENTS</Text>
          <Card style={styles.sectionCard} elevation="sm">
            <SettingRow
              icon="event-note"
              label="Planned Payments"
              subtitle={
                settings.plannedPayments?.length
                  ? `${settings.plannedPayments.length} payment(s) planned`
                  : 'No planned payments yet'
              }
              onPress={() => navigation.navigate('PlannedPayments')}
              right={<MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />}
            />
          </Card>

          {/* Donate & Feedback */}
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>SUPPORT & FEEDBACK</Text>
          <Card style={styles.sectionCard} elevation="sm">
            <Text style={[styles.donateTitle, { color: colors.text }]}>Donate via GCash</Text>
            <Text style={[styles.donateSubtitle, { color: colors.textSecondary }]}>Send support with this number or scan the QR placeholder below.</Text>
            <View style={[styles.qrCard, { backgroundColor: colors.surfaceSecondary }]}> 
              <Text style={[styles.qrText, { color: colors.textSecondary }]}>GCash: {settings.donationNumber || '09171234567'}</Text>
              <View style={[styles.qrPlaceholder, { borderColor: colors.border }]}> 
                <Text style={[styles.qrLabel, { color: colors.textSecondary }]}>QR</Text>
              </View>
            </View>
            <Text style={[styles.feedbackTitle, { color: colors.text }]}>Rate & share feedback</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity key={value} onPress={() => setRating(value)}>
                  <MaterialIcons
                    name={value <= rating ? 'star' : 'star-border'}
                    size={24}
                    color={value <= rating ? colors.primary : colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Input
              label="Message"
              value={feedbackText}
              onChangeText={setFeedbackText}
              placeholder="How can we improve?"
              multiline
              numberOfLines={3}
              style={{ marginBottom: Spacing.md }}
            />
            <Button title="Submit Feedback" onPress={handleSubmitFeedback} />
          </Card>

          {/* Budget */}
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>BUDGET</Text>
          <Card style={styles.sectionCard} elevation="sm">
            <SettingRow
              icon="account-balance-wallet"
              label="Monthly Budget"
              subtitle={formatCurrency(settings.monthlyBudget || 15000, settings.currency)}
              color="#FF6584"
              onPress={() => setShowBudgetInput(!showBudgetInput)}
              right={
                <MaterialIcons
                  name={showBudgetInput ? 'expand-less' : 'edit'}
                  size={20}
                  color={colors.textTertiary}
                />
              }
            />
            {showBudgetInput && (
              <View style={[styles.budgetInput, { borderTopColor: colors.separator }]}>
                <Input
                  value={budget}
                  onChangeText={setBudget}
                  placeholder="Enter monthly budget"
                  keyboardType="decimal-pad"
                  icon="attach-money"
                  prefix={settings.currency === 'PHP' ? '₱' : '$'}
                  style={{ marginBottom: Spacing.md }}
                />
                <Button title="Save Budget" onPress={handleBudgetSave} size="sm" />
              </View>
            )}
          </Card>

          {/* Data Management */}
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>DATA</Text>
          <Card style={styles.sectionCard} elevation="sm">
            <SettingRow
              icon="history"
              label="Delete History"
              subtitle="View and restore deleted expenses"
              color="#43D9AD"
              onPress={() => navigation.navigate('DeleteHistory')}
              right={<MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />}
            />
            <SettingRow
              icon="delete-forever"
              label="Clear All Data"
              subtitle="Permanently delete all expenses"
              color="#FF5252"
              onPress={handleClearData}
              right={<MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />}
              style={{ borderBottomWidth: 0 }}
            />
          </Card>

          {/* About */}
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>ABOUT</Text>
          <Card style={styles.sectionCard} elevation="sm">
            <SettingRow
              icon="info-outline"
              label="App Version"
              subtitle="v1.0.0 (Build 1)"
              color="#74B9FF"
            />
            <SettingRow
              icon="code"
              label="Developed By"
              subtitle="Raymart"
              color="#A29BFE"
            />
            <SettingRow
              icon="star-outline"
              label="Daily Expense Tracker"
              subtitle="Track your expenses, reach your goals"
              color="#FFE66D"
              style={{ borderBottomWidth: 0 }}
            />
          </Card>

          <View style={{ height: Layout.tabBarHeight + Spacing.xl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: Layout.screenPadding },
  profileCard: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  profileName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  profileSub: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  profileVersion: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  sectionCard: {
    marginBottom: Spacing.xl,
    padding: 0,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: { flex: 1, gap: 2 },
  settingLabel: { fontSize: FontSize.base, fontWeight: FontWeight.medium },
  settingSubtitle: { fontSize: FontSize.sm },
  settingRight: { alignItems: 'flex-end' },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  saveNameBtn: {
    width: 48,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  currencyPicker: {
    borderTopWidth: 1,
    paddingVertical: Spacing.sm,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    marginHorizontal: Spacing.sm,
  },
  currencySymbol: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    width: 30,
    textAlign: 'center',
  },
  currencyCode: { fontSize: FontSize.base, fontWeight: FontWeight.semiBold },
  currencyName: { fontSize: FontSize.xs },
  budgetInput: {
    padding: Spacing.md,
    borderTopWidth: 1,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
    marginTop: Spacing.md,
  },
  mascotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  mascotItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  mascotEmoji: {
    fontSize: 32,
  },
  mascotName: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  addButton: {
    width: 45,
    height: 45,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  listItemText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
  },
  listItemSub: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
  },
  emptyText: {
    padding: Spacing.md,
    fontSize: FontSize.sm,
  },
  donateTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  donateSubtitle: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
  },
  qrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  qrText: {
    fontSize: FontSize.sm,
  },
  qrPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrLabel: {
    fontSize: FontSize.sm,
  },
  feedbackTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
});

export default SettingsScreen;