import { endOfDay, endOfMonth, endOfWeek, format, isThisMonth, isThisWeek, isToday, isYesterday, parseISO, startOfDay, startOfMonth, startOfWeek, subDays } from 'date-fns';

export const formatCurrency = (amount, currency = 'PHP') => {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    PHP: '₱',
    JPY: '¥',
  };
  const symbol = symbols[currency] || currency;
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
};

export const formatDate = (dateString) => {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return format(date, 'EEEE');
  if (isThisMonth(date)) return format(date, 'MMM d');
  return format(date, 'MMM d, yyyy');
};

export const formatDateFull = (dateString) => {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, 'MMMM d, yyyy');
};

export const formatDateShort = (dateString) => {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, 'MMM d');
};

export const formatTime = (dateString) => {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, 'h:mm a');
};

export const formatMonth = (dateString) => {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, 'MMMM yyyy');
};

export const getDateRanges = () => {
  const now = new Date();
  return {
    today: {
      start: startOfDay(now),
      end: endOfDay(now),
    },
    thisWeek: {
      start: startOfWeek(now),
      end: endOfWeek(now),
    },
    thisMonth: {
      start: startOfMonth(now),
      end: endOfMonth(now),
    },
    last7Days: {
      start: startOfDay(subDays(now, 6)),
      end: endOfDay(now),
    },
    last30Days: {
      start: startOfDay(subDays(now, 29)),
      end: endOfDay(now),
    },
  };
};

export const filterExpensesByDateRange = (expenses, start, end) => {
  return expenses.filter((expense) => {
    const date = parseISO(expense.date);
    return date >= start && date <= end;
  });
};

export const groupExpensesByDate = (expenses) => {
  const groups = {};
  expenses.forEach((expense) => {
    const dateKey = expense.date.split('T')[0];
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(expense);
  });

  return Object.entries(groups)
    .sort(([a], [b]) => new Date(b) - new Date(a))
    .map(([date, items]) => ({
      date,
      displayDate: formatDate(date),
      total: items.reduce((sum, item) => sum + item.amount, 0),
      items: items.sort((a, b) => new Date(b.date) - new Date(a.date)),
    }));
};

export const sumExpenses = (expenses) => {
  return expenses.reduce((sum, exp) => sum + exp.amount, 0);
};

export const truncateText = (text, maxLength = 30) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getCurrentDateISO = () => {
  return new Date().toISOString();
};