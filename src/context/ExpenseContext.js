/**
 * ExpenseContext_PATCH.js
 * ─────────────────────────────────────────────────────────────────────────────
 * This file documents the changes needed in your ExpenseContext.js.
 * Copy-paste the relevant functions into your existing context file.
 *
 * KEY FIXES:
 *  1. deleteExpense   → automatically restores wallet balance
 *  2. updateExpense   → adjusts wallet balance for amount diff
 *  3. addExpense      → deducts from wallet correctly
 *  4. updateShoppingItem → allows updating individual shopping items + categories
 */

// ─── REPLACE your deleteExpense with this ────────────────────────────────────
const deleteExpense = async (id) => {
  try {
    const expense = expenses.find((e) => e.id === id);
    if (!expense) return;

    // 1. Move to delete history
    const history = await getDeleteHistory();
    const updated = [{ ...expense, deletedAt: new Date().toISOString() }, ...history];
    await saveDeleteHistory(updated);

    // 2. Remove from expenses list
    const newExpenses = expenses.filter((e) => e.id !== id);
    await saveExpenses(newExpenses);

    // 3. ✅ RESTORE the deleted amount back to wallet
    const currentWallet = settings.walletBalance ?? 0;
    const restoredBalance = currentWallet + expense.amount;
    await updateSettings('walletBalance', restoredBalance);

    setExpenses(newExpenses);
  } catch (e) {
    console.error('deleteExpense error:', e);
  }
};

// ─── REPLACE your addExpense with this ───────────────────────────────────────
const addExpense = async (expenseData) => {
  try {
    const newExpense = {
      id:        Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...expenseData,
    };

    const newExpenses = [newExpense, ...expenses];
    await saveExpenses(newExpenses);

    // ✅ Deduct from wallet
    const currentWallet = settings.walletBalance ?? 0;
    const newBalance    = Math.max(0, currentWallet - newExpense.amount);
    await updateSettings('walletBalance', newBalance);

    setExpenses(newExpenses);
    return newExpense;
  } catch (e) {
    console.error('addExpense error:', e);
    throw e;
  }
};

// ─── REPLACE your updateExpense with this ────────────────────────────────────
const updateExpense = async (id, updatedData) => {
  try {
    const oldExpense = expenses.find((e) => e.id === id);
    if (!oldExpense) return;

    const newExpenses = expenses.map((e) =>
      e.id === id ? { ...e, ...updatedData, updatedAt: new Date().toISOString() } : e
    );
    await saveExpenses(newExpenses);

    // ✅ Adjust wallet for the amount difference
    if (updatedData.amount !== undefined && updatedData.amount !== oldExpense.amount) {
      const diff = oldExpense.amount - updatedData.amount; // positive = saved money
      const currentWallet = settings.walletBalance ?? 0;
      await updateSettings('walletBalance', currentWallet + diff);
    }

    setExpenses(newExpenses);
  } catch (e) {
    console.error('updateExpense error:', e);
    throw e;
  }
};

// ─── ADD this new function to your context ────────────────────────────────────
const updateShoppingItem = async (id, updatedItem) => {
  try {
    if (id === '__categories__') {
      // Special key: updating custom categories list
      await updateSettings('shoppingCategories', updatedItem);
      return;
    }

    const currentList = settings.shoppingList || [];
    const newList = currentList.map((item) =>
      item.id === id ? { ...item, ...updatedItem } : item
    );
    await updateSettings('shoppingList', newList);
  } catch (e) {
    console.error('updateShoppingItem error:', e);
  }
};

// ─── ADD this to your context value export ────────────────────────────────────
// Make sure your context Provider value includes:
// updateShoppingItem,
// and the corrected: addExpense, deleteExpense, updateExpense

// ─── restoreExpense — also restore wallet ────────────────────────────────────
const restoreExpense = async (id) => {
  try {
    const history = await getDeleteHistory();
    const expense = history.find((e) => e.id === id);
    if (!expense) return false;

    const { deletedAt, ...expenseData } = expense;
    const newExpenses = [expenseData, ...expenses];
    await saveExpenses(newExpenses);

    // ✅ Deduct from wallet again (re-adding the expense)
    const currentWallet = settings.walletBalance ?? 0;
    await updateSettings('walletBalance', Math.max(0, currentWallet - expenseData.amount));

    // Remove from history
    const newHistory = history.filter((e) => e.id !== id);
    await saveDeleteHistory(newHistory);

    setExpenses(newExpenses);
    return true;
  } catch (e) {
    console.error('restoreExpense error:', e);
    return false;
  }
};