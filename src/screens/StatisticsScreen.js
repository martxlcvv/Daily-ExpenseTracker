/**
 * StatisticsScreen.js — Comprehensive financial statistics and insights
 * Features: Balance, Outlook, Cash Flow, Spending, Credit, Report, Assets
 */
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/common/Card';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const StatisticsScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const pad = width < 380 ? 16 : 20;

  const { settings, expenses, currentBalance, bankAccounts, bankTotal } = useExpenses();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('balance');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Refresh data when screen comes into focus
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const monthlyBudget = settings.monthlyBudget || 15000;
    const monthlyExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.createdAt);
      const now = new Date();
      return expenseDate.getMonth() === now.getMonth() &&
             expenseDate.getFullYear() === now.getFullYear();
    }).reduce((sum, e) => sum + e.amount, 0);

    const remainingBudget = monthlyBudget - monthlyExpenses;
    const savingsRate = monthlyBudget > 0 ? ((remainingBudget / monthlyBudget) * 100) : 0;

    // Cash flow calculation (simplified)
    const income = bankTotal + currentBalance;
    const outflow = monthlyExpenses;
    const netCashFlow = income - outflow;

    // Spending analysis
    const categories = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    const topSpendingCategory = Object.entries(categories)
      .sort(([,a], [,b]) => b - a)[0];

    // Assets calculation
    const totalAssets = bankTotal + currentBalance + (settings.investments || [])
      .reduce((sum, inv) => sum + inv.amount + inv.returns, 0);

    return {
      monthlyBudget,
      monthlyExpenses,
      remainingBudget,
      savingsRate,
      netCashFlow,
      topSpendingCategory,
      totalAssets,
      totalLiabilities: 0, // Could be expanded for credit cards, loans, etc.
      netWorth: totalAssets,
    };
  }, [expenses, settings, currentBalance, bankTotal]);

  const currency = settings.currency || 'PHP';

  const tabs = [
    { id: 'balance', label: 'Balance', icon: 'account-balance-wallet' },
    { id: 'outlook', label: 'Outlook', icon: 'trending-up' },
    { id: 'cashflow', label: 'Cash Flow', icon: 'swap-horiz' },
    { id: 'spending', label: 'Spending', icon: 'receipt' },
    { id: 'credit', label: 'Credit', icon: 'credit-card' },
    { id: 'report', label: 'Report', icon: 'assessment' },
    { id: 'assets', label: 'Assets', icon: 'business' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'balance':
        return (
          <View style={s.tabContent}>
            <Card style={s.statCard}>
              <View style={s.statHeader}>
                <MaterialIcons name="account-balance-wallet" size={24} color={colors.primary} />
                <Text style={[s.statTitle, { color: colors.text }]}>Current Balance</Text>
              </View>
              <Text style={[s.statValue, { color: colors.text }]}>
                {formatCurrency(currentBalance, currency)}
              </Text>
              <Text style={[s.statSub, { color: colors.textSecondary }]}>
                Available funds
              </Text>
            </Card>

            <Card style={s.statCard}>
              <View style={s.statHeader}>
                <MaterialIcons name="account-balance" size={24} color="#43D9AD" />
                <Text style={[s.statTitle, { color: colors.text }]}>Bank Accounts</Text>
              </View>
              <Text style={[s.statValue, { color: colors.text }]}>
                {formatCurrency(bankTotal, currency)}
              </Text>
              <Text style={[s.statSub, { color: colors.textSecondary }]}>
                {bankAccounts.length} account(s)
              </Text>
            </Card>

            <Card style={s.statCard}>
              <View style={s.statHeader}>
                <MaterialIcons name="savings" size={24} color="#FFB347" />
                <Text style={[s.statTitle, { color: colors.text }]}>Monthly Budget</Text>
              </View>
              <Text style={[s.statValue, { color: colors.text }]}>
                {formatCurrency(stats.monthlyBudget, currency)}
              </Text>
              <Text style={[s.statSub, { color: colors.textSecondary }]}>
                Remaining: {formatCurrency(stats.remainingBudget, currency)}
              </Text>
            </Card>
          </View>
        );

      case 'outlook':
        return (
          <View style={s.tabContent}>
            <Card style={s.statCard}>
              <View style={s.statHeader}>
                <MaterialIcons name="trending-up" size={24} color={stats.savingsRate >= 0 ? "#43D9AD" : "#FF5252"} />
                <Text style={[s.statTitle, { color: colors.text }]}>Savings Rate</Text>
              </View>
              <Text style={[s.statValue, { color: stats.savingsRate >= 0 ? "#43D9AD" : "#FF5252" }]}>
                {stats.savingsRate.toFixed(1)}%
              </Text>
              <Text style={[s.statSub, { color: colors.textSecondary }]}>
                {stats.savingsRate >= 0 ? 'Positive savings' : 'Overspending'}
              </Text>
            </Card>

            <Card style={s.statCard}>
              <View style={s.statHeader}>
                <MaterialIcons name="calendar-month" size={24} color="#7C75FF" />
                <Text style={[s.statTitle, { color: colors.text }]}>Monthly Progress</Text>
              </View>
              <View style={s.progressBar}>
                <View
                  style={[s.progressFill, {
                    width: `${Math.min(100, (stats.monthlyExpenses / stats.monthlyBudget) * 100)}%`,
                    backgroundColor: stats.monthlyExpenses > stats.monthlyBudget ? '#FF5252' : '#43D9AD'
                  }]}
                />
              </View>
              <Text style={[s.statSub, { color: colors.textSecondary }]}>
                {formatCurrency(stats.monthlyExpenses, currency)} of {formatCurrency(stats.monthlyBudget, currency)}
              </Text>
            </Card>

            <Card style={s.statCard}>
              <View style={s.statHeader}>
                <MaterialIcons name="insights" size={24} color="#FF6B6B" />
                <Text style={[s.statTitle, { color: colors.text }]}>Financial Health</Text>
              </View>
              <Text style={[s.statValue, { color: stats.netCashFlow >= 0 ? "#43D9AD" : "#FF5252" }]}>
                {stats.netCashFlow >= 0 ? 'Healthy' : 'Needs Attention'}
              </Text>
              <Text style={[s.statSub, { color: colors.textSecondary }]}>
                Net cash flow: {formatCurrency(stats.netCashFlow, currency)}
              </Text>
            </Card>
          </View>
        );

      case 'cashflow':
        return (
          <View style={s.tabContent}>
            <Card style={s.statCard}>
              <View style={s.statHeader}>
                <MaterialIcons name="trending-up" size={24} color="#43D9AD" />
                <Text style={[s.statTitle, { color: colors.text }]}>Income</Text>
              </View>
              <Text style={[s.statValue, { color: "#43D9AD" }]}>
                {formatCurrency(bankTotal + currentBalance, currency)}
              </Text>
              <Text style={[s.statSub, { color: colors.textSecondary }]}>
                Total available funds
              </Text>
            </Card>

            <Card style={s.statCard}>
              <View style={s.statHeader}>
                <MaterialIcons name="trending-down" size={24} color="#FF5252" />
                <Text style={[s.statTitle, { color: colors.text }]}>Expenses</Text>
              </View>
              <Text style={[s.statValue, { color: "#FF5252" }]}>
                {formatCurrency(stats.monthlyExpenses, currency)}
              </Text>
              <Text style={[s.statSub, { color: colors.textSecondary }]}>
                This month
              </Text>
            </Card>

            <Card style={s.statCard}>
              <View style={s.statHeader}>
                <MaterialIcons name="swap-horiz" size={24} color={stats.netCashFlow >= 0 ? "#43D9AD" : "#FF5252"} />
                <Text style={[s.statTitle, { color: colors.text }]}>Net Cash Flow</Text>
              </View>
              <Text style={[s.statValue, { color: stats.netCashFlow >= 0 ? "#43D9AD" : "#FF5252" }]}>
                {formatCurrency(stats.netCashFlow, currency)}
              </Text>
              <Text style={[s.statSub, { color: colors.textSecondary }]}>
                Income - Expenses
              </Text>
            </Card>
          </View>
        );

      case 'spending':
        return (
          <View style={s.tabContent}>
            <Card style={s.statCard}>
              <View style={s.statHeader}>
                <MaterialIcons name="receipt" size={24} color="#FF6B6B" />
                <Text style={[s.statTitle, { color: colors.text }]}>Monthly Spending</Text>
              </View>
              <Text style={[s.statValue, { color: "#FF6B6B" }]}>
                {formatCurrency(stats.monthlyExpenses, currency)}
              </Text>
              <Text style={[s.statSub, { color: colors.textSecondary }]}>
                Current month total
              </Text>
            </Card>

            {stats.topSpendingCategory && (
              <Card style={s.statCard}>
                <View style={s.statHeader}>
                  <MaterialIcons name="local-fire-department" size={24} color="#FFB347" />
                  <Text style={[s.statTitle, { color: colors.text }]}>Top Category</Text>
                </View>
                <Text style={[s.statValue, { color: "#FFB347" }]}>
                  {stats.topSpendingCategory[0]}
                </Text>
                <Text style={[s.statSub, { color: colors.textSecondary }]}>
                  {formatCurrency(stats.topSpendingCategory[1], currency)}
                </Text>
              </Card>
            )}

            <Card style={s.statCard}>
              <View style={s.statHeader}>
                <MaterialIcons name="pie-chart" size={24} color="#7C75FF" />
                <Text style={[s.statTitle, { color: colors.text }]}>Spending Breakdown</Text>
              </View>
              <Text style={[s.statValue, { color: colors.text }]}>
                {Object.keys(stats.categories || {}).length} categories
              </Text>
              <Text style={[s.statSub, { color: colors.textSecondary }]}>
                Tap to view detailed breakdown
              </Text>
            </Card>
          </View>
        );

      case 'credit':
        return (
          <View style={s.tabContent}>
            <Card style={s.statCard}>
              <View style={s.statHeader}>
                <MaterialIcons name="credit-card" size={24} color="#43D9AD" />
                <Text style={[s.statTitle, { color: colors.text }]}>Credit Status</Text>
              </View>
              <Text style={[s.statValue, { color: "#43D9AD" }]}>No Credit Cards</Text>
              <Text style={[s.statSub, { color: colors.textSecondary }]}>
                Add credit cards to track
              </Text>
            </Card>

            <Card style={s.statCard}>
              <View style={s.statHeader}>
                <MaterialIcons name="account-balance" size={24} color="#7C75FF" />
                <Text style={[s.statTitle, { color: colors.text }]}>Available Credit</Text>
              </View>
              <Text style={[s.statValue, { color: colors.text }]}>₱0</Text>
              <Text style={[s.statSub, { color: colors.textSecondary }]}>
                No credit accounts configured
              </Text>
            </Card>

            <TouchableOpacity
              style={[s.addButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('BankAccounts')}
            >
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
              <Text style={s.addButtonText}>Add Credit Account</Text>
            </TouchableOpacity>
          </View>
        );

      case 'report':
        return (
          <View style={s.tabContent}>
            <Card style={s.statCard}>
              <View style={s.statHeader}>
                <MaterialIcons name="assessment" size={24} color="#FFB347" />
                <Text style={[s.statTitle, { color: colors.text }]}>Monthly Report</Text>
              </View>
              <Text style={[s.statValue, { color: colors.text }]}>
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <Text style={[s.statSub, { color: colors.textSecondary }]}>
                {expenses.length} transactions
              </Text>
            </Card>

            <Card style={s.statCard}>
              <View style={s.statHeader}>
                <MaterialIcons name="trending-up" size={24} color="#43D9AD" />
                <Text style={[s.statTitle, { color: colors.text }]}>Average Daily</Text>
              </View>
              <Text style={[s.statValue, { color: "#43D9AD" }]}>
                {formatCurrency(stats.monthlyExpenses / 30, currency)}
              </Text>
              <Text style={[s.statSub, { color: colors.textSecondary }]}>
                Based on 30 days
              </Text>
            </Card>

            <TouchableOpacity
              style={[s.addButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Analytics')}
            >
              <MaterialIcons name="analytics" size={20} color="#FFFFFF" />
              <Text style={s.addButtonText}>View Detailed Analytics</Text>
            </TouchableOpacity>
          </View>
        );

      case 'assets':
        return (
          <View style={s.tabContent}>
            <Card style={s.statCard}>
              <View style={s.statHeader}>
                <MaterialIcons name="account-balance-wallet" size={24} color="#43D9AD" />
                <Text style={[s.statTitle, { color: colors.text }]}>Cash Assets</Text>
              </View>
              <Text style={[s.statValue, { color: "#43D9AD" }]}>
                {formatCurrency(currentBalance + bankTotal, currency)}
              </Text>
              <Text style={[s.statSub, { color: colors.textSecondary }]}>
                Wallet + Bank accounts
              </Text>
            </Card>

            <Card style={s.statCard}>
              <View style={s.statHeader}>
                <MaterialIcons name="trending-up" size={24} color="#FFB347" />
                <Text style={[s.statTitle, { color: colors.text }]}>Investments</Text>
              </View>
              <Text style={[s.statValue, { color: "#FFB347" }]}>
                {formatCurrency((settings.investments || []).reduce((sum, inv) => sum + inv.amount + inv.returns, 0), currency)}
              </Text>
              <Text style={[s.statSub, { color: colors.textSecondary }]}>
                {(settings.investments || []).length} investment(s)
              </Text>
            </Card>

            <Card style={s.statCard}>
              <View style={s.statHeader}>
                <MaterialIcons name="business" size={24} color="#7C75FF" />
                <Text style={[s.statTitle, { color: colors.text }]}>Total Assets</Text>
              </View>
              <Text style={[s.statValue, { color: "#7C75FF" }]}>
                {formatCurrency(stats.totalAssets, currency)}
              </Text>
              <Text style={[s.statSub, { color: colors.textSecondary }]}>
                Net worth: {formatCurrency(stats.netWorth, currency)}
              </Text>
            </Card>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={s.safe} edges={['top']}>
        {/* Header */}
        <View style={[s.header, { paddingHorizontal: pad }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[s.backBtn, { backgroundColor: colors.surfaceSecondary }]}>
            <MaterialIcons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[s.title, { color: colors.text }]}>Statistics 📊</Text>
          <View style={{ width: 42 }} />
        </View>

        {/* Tab Navigation */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[s.tabsContainer, { paddingHorizontal: pad }]}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[s.tab, activeTab === tab.id && [s.activeTab, { borderColor: colors.primary }]]}
            >
              <MaterialIcons
                name={tab.icon}
                size={18}
                color={activeTab === tab.id ? colors.primary : colors.textSecondary}
              />
              <Text style={[s.tabLabel, {
                color: activeTab === tab.id ? colors.primary : colors.textSecondary,
                fontWeight: activeTab === tab.id ? '600' : '400'
              }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Animated.ScrollView
          contentContainerStyle={[s.scroll, { paddingHorizontal: pad }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          style={{ opacity: fadeAnim }}
        >
          {renderTabContent()}

          <View style={{ height: 100 }} />
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  backBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },

  tabsContainer: { paddingVertical: 12, gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6, borderWidth: 1, borderColor: 'transparent' },
  activeTab: { backgroundColor: 'rgba(108, 99, 255, 0.1)' },
  tabLabel: { fontSize: 14 },

  scroll: { paddingTop: 8 },
  tabContent: { gap: 16 },

  statCard: { padding: 20, borderRadius: 16 },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  statTitle: { fontSize: 16, fontWeight: '600' },
  statValue: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  statSub: { fontSize: 12 },

  progressBar: { height: 6, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 3, marginBottom: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },

  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 8, marginTop: 8 },
  addButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});

export default StatisticsScreen;