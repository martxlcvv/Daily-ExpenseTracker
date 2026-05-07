/**
 * ExpenseContext.js — Complete working implementation
 * FIX: Previous file was just a patch-doc with no actual React Context/Provider.
 *      That caused "useExpenses must be used within ExpenseProvider" crash on launch.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getDeleteHistory,
  getExpenses,
  getSettings,
  saveDeleteHistory,
  saveExpenses,
  saveSettings,
} from '../services/StorageService';
import { filterExpensesByDateRange, getDateRanges } from '../utils/formatters';

const ExpenseContext = createContext(null);

const DEFAULT_SETTINGS = {
  currency: 'PHP',
  notificationsEnabled: false,
  darkMode: true,
  monthlyBudget: 15000,
  walletBalance: 15000,
  hideWallet: false,
  shoppingList: [],
  plannedPayments: [],
  shoppingCategories: [],
  firstName: '',
  notifHour: 20,
};

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // ── Load persisted data ───────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [loadedExpenses, loadedSettings] = await Promise.all([
          getExpenses(),
          getSettings(),
        ]);
        setExpenses(loadedExpenses || []);
        setSettings({ ...DEFAULT_SETTINGS, ...(loadedSettings || {}) });
      } catch (e) {
        console.error('ExpenseContext loadData error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Computed values ───────────────────────────────────────────────────────
  const ranges = useMemo(() => getDateRanges(), []);

  const todayExpenses = useMemo(
    () => filterExpensesByDateRange(expenses, ranges.today.start, ranges.today.end),
    [expenses]
  );
  const weekExpenses = useMemo(
    () => filterExpensesByDateRange(expenses, ranges.thisWeek.start, ranges.thisWeek.end),
    [expenses]
  );
  const monthExpenses = useMemo(
    () => filterExpensesByDateRange(expenses, ranges.thisMonth.start, ranges.thisMonth.end),
    [expenses]
  );

  const todayTotal = useMemo(() => todayExpenses.reduce((s, e) => s + e.amount, 0), [todayExpenses]);
  const weekTotal  = useMemo(() => weekExpenses.reduce((s, e) => s + e.amount, 0), [weekExpenses]);
  const monthTotal = useMemo(() => monthExpenses.reduce((s, e) => s + e.amount, 0), [monthExpenses]);
  const currentBalance = settings.walletBalance ?? 0;

  // ── Settings ─────────────────────────────────────────────────────────────
  const updateSettings = useCallback(async (key, value) => {
    try {
      setSettings((prev) => {
        const next = { ...prev, [key]: value };
        saveSettings(next);   // fire-and-forget persists
        return next;
      });
    } catch (e) {
      console.error('updateSettings error:', e);
    }
  }, []);

  // ── Expenses ──────────────────────────────────────────────────────────────
  const addExpense = useCallback(async (expenseData) => {
    try {
      const newExpense = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
        createdAt: new Date().toISOString(),
        ...expenseData,
      };
      const next = [newExpense, ...expenses];
      await saveExpenses(next);
      const newBalance = Math.max(0, (settings.walletBalance ?? 0) - newExpense.amount);
      await updateSettings('walletBalance', newBalance);
      setExpenses(next);
      return newExpense;
    } catch (e) {
      console.error('addExpense error:', e);
      throw e;
    }
  }, [expenses, settings.walletBalance, updateSettings]);

  const updateExpense = useCallback(async (id, updatedData) => {
    try {
      const old = expenses.find((e) => e.id === id);
      if (!old) return;
      const next = expenses.map((e) =>
        e.id === id ? { ...e, ...updatedData, updatedAt: new Date().toISOString() } : e
      );
      await saveExpenses(next);
      if (updatedData.amount !== undefined && updatedData.amount !== old.amount) {
        const diff = old.amount - updatedData.amount;
        await updateSettings('walletBalance', (settings.walletBalance ?? 0) + diff);
      }
      setExpenses(next);
    } catch (e) {
      console.error('updateExpense error:', e);
      throw e;
    }
  }, [expenses, settings.walletBalance, updateSettings]);

  const deleteExpense = useCallback(async (id) => {
    try {
      const expense = expenses.find((e) => e.id === id);
      if (!expense) return;

      // Archive to delete history
      const history = await getDeleteHistory();
      await saveDeleteHistory([{ ...expense, deletedAt: new Date().toISOString() }, ...history]);

      const next = expenses.filter((e) => e.id !== id);
      await saveExpenses(next);
      await updateSettings('walletBalance', (settings.walletBalance ?? 0) + expense.amount);
      setExpenses(next);
    } catch (e) {
      console.error('deleteExpense error:', e);
    }
  }, [expenses, settings.walletBalance, updateSettings]);

  const restoreExpense = useCallback(async (id) => {
    try {
      const history = await getDeleteHistory();
      const expense = history.find((e) => e.id === id);
      if (!expense) return false;

      const { deletedAt, ...data } = expense;
      const next = [data, ...expenses];
      await saveExpenses(next);
      await updateSettings('walletBalance', Math.max(0, (settings.walletBalance ?? 0) - data.amount));
      await saveDeleteHistory(history.filter((e) => e.id !== id));
      setExpenses(next);
      return true;
    } catch (e) {
      console.error('restoreExpense error:', e);
      return false;
    }
  }, [expenses, settings.walletBalance, updateSettings]);

  const getExpenseById = useCallback((id) => expenses.find((e) => e.id === id), [expenses]);

  const searchExpenses = useCallback((query) => {
    if (!query?.trim()) return expenses;
    const q = query.toLowerCase();
    return expenses.filter((e) =>
      e.category?.toLowerCase().includes(q) ||
      e.note?.toLowerCase().includes(q) ||
      e.name?.toLowerCase().includes(q)
    );
  }, [expenses]);

  const clearAllExpenses = useCallback(async () => {
    await saveExpenses([]);
    setExpenses([]);
  }, []);

  // ── Shopping list ─────────────────────────────────────────────────────────
  const addShoppingItem = useCallback(async (item) => {
    const newItem = { id: Date.now().toString(), ...item };
    const newList = [...(settings.shoppingList || []), newItem];
    await updateSettings('shoppingList', newList);
  }, [settings.shoppingList, updateSettings]);

  const removeShoppingItem = useCallback(async (id) => {
    const newList = (settings.shoppingList || []).filter((i) => i.id !== id);
    await updateSettings('shoppingList', newList);
  }, [settings.shoppingList, updateSettings]);

  const updateShoppingItem = useCallback(async (id, updatedItem) => {
    if (id === '__categories__') {
      await updateSettings('shoppingCategories', updatedItem);
      return;
    }
    const newList = (settings.shoppingList || []).map((i) =>
      i.id === id ? { ...i, ...updatedItem } : i
    );
    await updateSettings('shoppingList', newList);
  }, [settings.shoppingList, updateSettings]);

  // ── Planned payments ──────────────────────────────────────────────────────
  const addPlannedPayment = useCallback(async (payment) => {
    const newPayment = { id: Date.now().toString(), ...payment };
    const list = [...(settings.plannedPayments || []), newPayment];
    await updateSettings('plannedPayments', list);
  }, [settings.plannedPayments, updateSettings]);

  const removePlannedPayment = useCallback(async (id) => {
    const list = (settings.plannedPayments || []).filter((p) => p.id !== id);
    await updateSettings('plannedPayments', list);
  }, [settings.plannedPayments, updateSettings]);

  // ── Toggle hide wallet ────────────────────────────────────────────────────
  const toggleHideWallet = useCallback(async () => {
    await updateSettings('hideWallet', !settings.hideWallet);
  }, [settings.hideWallet, updateSettings]);

  // ── Context value ─────────────────────────────────────────────────────────
  const value = {
    expenses,
    settings,
    loading,
    todayExpenses,
    weekExpenses,
    monthExpenses,
    todayTotal,
    weekTotal,
    monthTotal,
    currentBalance,
    addExpense,
    updateExpense,
    deleteExpense,
    restoreExpense,
    getExpenseById,
    searchExpenses,
    updateSettings,
    addShoppingItem,
    removeShoppingItem,
    updateShoppingItem,
    addPlannedPayment,
    removePlannedPayment,
    toggleHideWallet,
    clearAllExpenses,
  };

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
};

export const useExpenses = () => {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenses must be used within ExpenseProvider');
  return ctx;
};