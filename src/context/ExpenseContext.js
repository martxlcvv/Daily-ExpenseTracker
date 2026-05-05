import { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getExpenses, getSettings, saveExpenses, addExpense as storageAdd, deleteExpense as storageDelete, updateExpense as storageUpdate, updateSetting } from '../services/StorageService';
import { DUMMY_EXPENSES } from '../utils/dummyData';
import { filterExpensesByDateRange, getDateRanges, sumExpenses } from '../utils/formatters';

const ExpenseContext = createContext(null);

const DEFAULT_SETTINGS = {
  firstName: '',
  monthlyBudget: 15000,
  currency: 'PHP',
  darkMode: false,
  notificationsEnabled: false,
  mascotType: 'squirrel',
  avatarImage: null,
  avatarVoice: false,
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

      // Use dummy data if storage is empty
      if (storedExpenses.length === 0) {
        await saveExpenses(DUMMY_EXPENSES);
        setExpenses(DUMMY_EXPENSES);
      } else {
        setExpenses(storedExpenses);
      }

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

    // Budget
    monthlyBudget,
    budgetUsed,
    budgetRemaining,

    // Methods
    addExpense,
    updateExpense,
    deleteExpense,
    updateSettings,
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
