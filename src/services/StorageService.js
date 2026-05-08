import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  EXPENSES: '@daily_expense_tracker:expenses',
  SETTINGS: '@daily_expense_tracker:settings',
  ONBOARDING: '@daily_expense_tracker:onboarding_complete',
  DELETE_HISTORY: '@daily_expense_tracker:delete_history',
};

// ─── Expense Methods ──────────────────────────────────────────────────────────

export const getExpenses = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.EXPENSES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('StorageService.getExpenses error:', e);
    // Clear corrupted data
    await AsyncStorage.removeItem(KEYS.EXPENSES);
    return [];
  }
};

export const saveExpenses = async (expenses) => {
  try {
    await AsyncStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
    return true;
  } catch (e) {
    console.error('StorageService.saveExpenses error:', e);
    return false;
  }
};

export const addExpense = async (expense) => {
  try {
    const expenses = await getExpenses();
    const updated = [expense, ...expenses];
    await saveExpenses(updated);
    return updated;
  } catch (e) {
    console.error('StorageService.addExpense error:', e);
    return null;
  }
};

export const updateExpense = async (id, updatedData) => {
  try {
    const expenses = await getExpenses();
    const updated = expenses.map((e) => (e.id === id ? { ...e, ...updatedData } : e));
    await saveExpenses(updated);
    return updated;
  } catch (e) {
    console.error('StorageService.updateExpense error:', e);
    return null;
  }
};

export const deleteExpense = async (id) => {
  try {
    const expenses = await getExpenses();
    const expenseToDelete = expenses.find((e) => e.id === id);
    
    // Add to delete history
    if (expenseToDelete) {
      const history = await getDeleteHistory();
      const updatedHistory = [
        ...history,
        {
          ...expenseToDelete,
          deletedAt: new Date().toISOString(),
        },
      ];
      await saveDeleteHistory(updatedHistory);
    }

    const updated = expenses.filter((e) => e.id !== id);
    await saveExpenses(updated);
    return updated;
  } catch (e) {
    console.error('StorageService.deleteExpense error:', e);
    return null;
  }
};

export const deleteAllExpenses = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.EXPENSES);
    return true;
  } catch (e) {
    console.error('StorageService.deleteAllExpenses error:', e);
    return false;
  }
};

// ─── Settings Methods ─────────────────────────────────────────────────────────

export const getSettings = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    return raw
      ? JSON.parse(raw)
      : {
          currency: 'PHP',
          notificationsEnabled: false,
          notificationTime: '20:00',
          darkMode: true,
          monthlyBudget: 0,
          walletBalance: 15000,
          hideWallet: false,
          shoppingList: [],
          plannedPayments: [],
          bankAccounts: [],
          feedbackEntries: [],
          donationNumber: '09171234567',
        };
  } catch (e) {
    console.error('StorageService.getSettings error:', e);
    // Clear corrupted data
    await AsyncStorage.removeItem(KEYS.SETTINGS);
    return {
      currency: 'PHP',
      notificationsEnabled: false,
      darkMode: true,
      monthlyBudget: 0,
      walletBalance: 15000,
      hideWallet: false,
      shoppingList: [],
      plannedPayments: [],
      bankAccounts: [],
      feedbackEntries: [],
      donationNumber: '09171234567',
    };
  }
};

export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (e) {
    console.error('StorageService.saveSettings error:', e);
    return false;
  }
};

export const updateSetting = async (key, value) => {
  try {
    const settings = await getSettings();
    const updated = { ...settings, [key]: value };
    await saveSettings(updated);
    return updated;
  } catch (e) {
    console.error('StorageService.updateSetting error:', e);
    return null;
  }
};

// ─── Onboarding ───────────────────────────────────────────────────────────────

export const isOnboardingComplete = async () => {
  try {
    const val = await AsyncStorage.getItem(KEYS.ONBOARDING);
    return val === 'true';
  } catch (e) {
    return false;
  }
};

export const setOnboardingComplete = async () => {
  try {
    await AsyncStorage.setItem(KEYS.ONBOARDING, 'true');
    return true;
  } catch (e) {
    return false;
  }
};

// ─── Delete History ───────────────────────────────────────────────────────────

export const getDeleteHistory = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.DELETE_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('StorageService.getDeleteHistory error:', e);
    await AsyncStorage.removeItem(KEYS.DELETE_HISTORY);
    return [];
  }
};

export const saveDeleteHistory = async (history) => {
  try {
    // Keep only last 100 deleted items
    const limited = history.slice(0, 100);
    await AsyncStorage.setItem(KEYS.DELETE_HISTORY, JSON.stringify(limited));
    return true;
  } catch (e) {
    console.error('StorageService.saveDeleteHistory error:', e);
    return false;
  }
};

export const restoreFromHistory = async (expenseId) => {
  try {
    const history = await getDeleteHistory();
    const expenseToRestore = history.find((e) => e.id === expenseId);
    
    if (!expenseToRestore) return false;

    // Remove from history
    const updated = history.filter((e) => e.id !== expenseId);
    await saveDeleteHistory(updated);

    // Add back to expenses
    const expenses = await getExpenses();
    const withRestored = [expenseToRestore, ...expenses];
    await saveExpenses(withRestored);

    return true;
  } catch (e) {
    console.error('StorageService.restoreFromHistory error:', e);
    return false;
  }
};

export const clearDeleteHistory = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.DELETE_HISTORY);
    return true;
  } catch (e) {
    console.error('StorageService.clearDeleteHistory error:', e);
    return false;
  }
};

export const bulkDeleteExpenses = async (ids) => {
  try {
    const history = await getDeleteHistory();
    const remaining = history.filter((expense) => !ids.includes(expense.id));
    await saveDeleteHistory(remaining);
    return true;
  } catch (e) {
    console.error('StorageService.bulkDeleteExpenses error:', e);
    return false;
  }
};

// ─── Data Export ──────────────────────────────────────────────────────────────

export const exportAllData = async () => {
  const expenses = await getExpenses();
  const settings = await getSettings();
  return { expenses, settings, exportedAt: new Date().toISOString() };
};

const StorageService = {
  getExpenses,
  saveExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  deleteAllExpenses,
  getSettings,
  saveSettings,
  updateSetting,
  isOnboardingComplete,
  setOnboardingComplete,
  exportAllData,
  getDeleteHistory,
  saveDeleteHistory,
  restoreFromHistory,
  clearDeleteHistory,
  bulkDeleteExpenses,
};

export default StorageService;