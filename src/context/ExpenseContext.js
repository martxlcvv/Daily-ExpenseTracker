import { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  getExpenses,
  getSettings,
  restoreFromHistory,
  saveExpenses,
  addExpense as storageAdd,
  deleteExpense as storageDelete,
  updateExpense as storageUpdate,
  updateSetting
} from '../services/StorageService';
import { filterExpensesByDateRange, getDateRanges, sumExpenses } from '../utils/formatters';

const ExpenseContext = createContext(null);

const DEFAULT_SETTINGS = {
  firstName: '',
  monthlyBudget: 15000,
  walletBalance: 15000,
  hideWallet: false,
  currency: 'PHP',
  notificationsEnabled: false,
  darkMode: false,
  mascotType: 'squirrel',
  avatarImage: null,
  avatarVoice: false,
  shoppingList: [],
  plannedPayments: [],
  feedbackEntries: [],
  donationNumber: '09171234567',
};

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // ─── Init ─────────────────────────────────────────────────────────
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      const [storedExpenses, storedSettings] = await Promise.all([
        getExpenses(),
        getSettings(),
      ]);

      // Load stored expenses (empty if no data)
      setExpenses(storedExpenses);

      setSettings({
        ...DEFAULT_SETTINGS,
        ...storedSettings,
      });
    } catch (e) {
      console.error('ExpenseContext init error:', e);
    } finally {
      setLoading(false);
    }
  };

  // ─── Expense Operations ─────────────────────────────────────────────
  const addExpense = async (expenseData) => {
    try {
      const newExpense = {
        id: uuidv4(),
        ...expenseData,
        createdAt: new Date().toISOString(),
      };
      const updated = await storageAdd(newExpense);
      setExpenses(updated);
      return newExpense;
    } catch (e) {
      console.error('addExpense error:', e);
      throw e;
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      const updated = await storageUpdate(id, expenseData);
      setExpenses(updated);
    } catch (e) {
      console.error('updateExpense error:', e);
      throw e;
    }
  };

  const deleteExpense = async (id) => {
    try {
      const updated = await storageDelete(id);
      setExpenses(updated);
    } catch (e) {
      console.error('deleteExpense error:', e);
      throw e;
    }
  };

  const getExpenseById = (id) => {
    return expenses.find((expense) => expense.id === id) || null;
  };

  const restoreExpense = async (id) => {
    try {
      const restored = await restoreFromHistory(id);
      if (restored) {
        const updated = await getExpenses();
        setExpenses(updated);
      }
      return restored;
    } catch (e) {
      console.error('restoreExpense error:', e);
      return false;
    }
  };

  // ─── Computed Values ───────────────────────────────────────────────
  const ranges = getDateRanges();

  const todayExpenses = expenses.filter((e) =>
    filterExpensesByDateRange([e], ranges.today.start, ranges.today.end).length > 0
  );

  const weekExpenses = expenses.filter((e) =>
    filterExpensesByDateRange([e], ranges.thisWeek.start, ranges.thisWeek.end).length > 0
  );

  const monthExpenses = expenses.filter((e) =>
    filterExpensesByDateRange([e], ranges.thisMonth.start, ranges.thisMonth.end).length > 0
  );

  const todayTotal = sumExpenses(todayExpenses);
  const weekTotal = sumExpenses(weekExpenses);
  const monthTotal = sumExpenses(monthExpenses);

  const monthlyBudget = settings.monthlyBudget || 15000;
  const budgetUsed = (monthTotal / monthlyBudget) * 100;
  const budgetRemaining = Math.max(0, monthlyBudget - monthTotal);
  const totalExpenses = sumExpenses(expenses);
  const currentBalance = (settings.walletBalance ?? 0) - totalExpenses;

  // ─── Settings Operations ─────────────────────────────────────────────
  const updateSettings = async (key, value) => {
    try {
      await updateSetting(key, value);
      setSettings((prev) => ({ ...prev, [key]: value }));
    } catch (e) {
      console.error('updateSettings error:', e);
      throw e;
    }
  };

  const setWalletBalance = async (amount) => {
    const value = Number(amount) || 0;
    await updateSettings('walletBalance', value);
  };

  const toggleHideWallet = async () => {
    await updateSettings('hideWallet', !settings.hideWallet);
  };

  const addShoppingItem = async (item) => {
    const nextList = [
      { id: uuidv4(), name: item, addedAt: new Date().toISOString() },
      ...(settings.shoppingList || []),
    ];
    await updateSettings('shoppingList', nextList);
  };

  const removeShoppingItem = async (itemId) => {
    const nextList = (settings.shoppingList || []).filter((item) => item.id !== itemId);
    await updateSettings('shoppingList', nextList);
  };

  const addPlannedPayment = async (payment) => {
    const nextList = [
      { id: uuidv4(), ...payment, createdAt: new Date().toISOString() },
      ...(settings.plannedPayments || []),
    ];
    await updateSettings('plannedPayments', nextList);
  };

  const removePlannedPayment = async (paymentId) => {
    const nextList = (settings.plannedPayments || []).filter((item) => item.id !== paymentId);
    await updateSettings('plannedPayments', nextList);
  };

  const submitFeedback = async (feedback) => {
    const nextList = [
      { id: uuidv4(), message: feedback, submittedAt: new Date().toISOString() },
      ...(settings.feedbackEntries || []),
    ];
    await updateSettings('feedbackEntries', nextList);
  };

  const clearAllExpenses = async () => {
    try {
      await saveExpenses([]);
      setExpenses([]);
    } catch (e) {
      console.error('clearAllExpenses error:', e);
      throw e;
    }
  };

  // ─── Search ────────────────────────────────────────────────────────
  const searchExpenses = (query) => {
    if (!query.trim()) return expenses;
    const lowerQuery = query.toLowerCase();
    return expenses.filter(
      (e) =>
        e.note?.toLowerCase().includes(lowerQuery) ||
        e.category.toLowerCase().includes(lowerQuery)
    );
  };

  const value = {
    // Data
    expenses,
    settings,
    loading,

    // Filtered lists
    todayExpenses,
    weekExpenses,
    monthExpenses,

    // Totals
    todayTotal,
    weekTotal,
    monthTotal,
    totalExpenses,
    currentBalance,

    // Budget
    monthlyBudget,
    budgetUsed,
    budgetRemaining,

    // Methods
    addExpense,
    updateExpense,
    deleteExpense,
    restoreExpense,
    getExpenseById,
    updateSettings,
    setWalletBalance,
    toggleHideWallet,
    addShoppingItem,
    removeShoppingItem,
    addPlannedPayment,
    removePlannedPayment,
    submitFeedback,
    clearAllExpenses,
    searchExpenses,
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within ExpenseProvider');
  }
  return context;
};
