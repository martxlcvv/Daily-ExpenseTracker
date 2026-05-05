import { subDays, subHours } from 'date-fns';

const makeDate = (daysAgo, hoursAgo = 0) => {
  return subHours(subDays(new Date(), daysAgo), hoursAgo).toISOString();
};

export const DUMMY_EXPENSES = [
  // Today
  { id: 'e001', amount: 185.50, category: 'food', note: 'Lunch at Jollibee', date: makeDate(0, 2) },
  { id: 'e002', amount: 45.00, category: 'transport', note: 'Grab ride to office', date: makeDate(0, 5) },
  { id: 'e003', amount: 320.00, category: 'shopping', note: 'Groceries at SM', date: makeDate(0, 1) },

  // Yesterday
  { id: 'e004', amount: 1200.00, category: 'bills', note: 'Monthly electricity bill', date: makeDate(1, 3) },
  { id: 'e005', amount: 95.00, category: 'food', note: 'Coffee and snacks', date: makeDate(1, 6) },
  { id: 'e006', amount: 250.00, category: 'health', note: 'Vitamins at Mercury Drug', date: makeDate(1, 1) },

  // 2 days ago
  { id: 'e007', amount: 500.00, category: 'entertainment', note: 'Netflix subscription', date: makeDate(2, 4) },
  { id: 'e008', amount: 780.00, category: 'shopping', note: 'New shoes at Penshoppe', date: makeDate(2, 2) },
  { id: 'e009', amount: 65.00, category: 'transport', note: 'Jeepney & MRT fare', date: makeDate(2, 7) },

  // 3 days ago
  { id: 'e010', amount: 350.00, category: 'food', note: 'Dinner at Mang Inasal', date: makeDate(3, 2) },
  { id: 'e011', amount: 1500.00, category: 'bills', note: 'Internet monthly plan', date: makeDate(3, 5) },
  { id: 'e012', amount: 120.00, category: 'personal', note: 'Haircut at salon', date: makeDate(3, 1) },

  // 5 days ago
  { id: 'e013', amount: 2500.00, category: 'education', note: 'Online course subscription', date: makeDate(5, 3) },
  { id: 'e014', amount: 180.00, category: 'food', note: 'Breakfast at McDo', date: makeDate(5, 8) },
  { id: 'e015', amount: 450.00, category: 'transport', note: 'Grab to airport', date: makeDate(5, 4) },

  // 7 days ago
  { id: 'e016', amount: 3200.00, category: 'travel', note: 'Bus ticket to Tagaytay', date: makeDate(7, 2) },
  { id: 'e017', amount: 600.00, category: 'entertainment', note: 'Cinema & popcorn', date: makeDate(7, 5) },
  { id: 'e018', amount: 220.00, category: 'food', note: 'Pizza delivery', date: makeDate(7, 1) },

  // 10 days ago
  { id: 'e019', amount: 890.00, category: 'health', note: 'Doctor consultation', date: makeDate(10, 3) },
  { id: 'e020', amount: 1100.00, category: 'shopping', note: 'Home supplies', date: makeDate(10, 2) },
  { id: 'e021', amount: 75.00, category: 'food', note: 'Merienda at bakery', date: makeDate(10, 6) },

  // 14 days ago
  { id: 'e022', amount: 4500.00, category: 'bills', note: 'Rent partial payment', date: makeDate(14, 1) },
  { id: 'e023', amount: 320.00, category: 'personal', note: 'Skincare products', date: makeDate(14, 4) },
  { id: 'e024', amount: 200.00, category: 'transport', note: 'Gas for motorcycle', date: makeDate(14, 3) },

  // 20 days ago
  { id: 'e025', amount: 1850.00, category: 'shopping', note: 'Clothes at Divisoria', date: makeDate(20, 2) },
  { id: 'e026', amount: 650.00, category: 'entertainment', note: 'Birthday celebration', date: makeDate(20, 5) },
  { id: 'e027', amount: 90.00, category: 'food', note: 'Siomai & rice', date: makeDate(20, 3) },
];

export const DUMMY_SETTINGS = {
  currency: 'PHP',
  notificationsEnabled: true,
  notificationTime: '20:00',
  darkMode: false,
  monthlyBudget: 15000,
  firstName: 'User',
};