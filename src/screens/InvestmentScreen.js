/**
 * InvestmentScreen.js — Track investments and financial goals
 * Features: Portfolio overview, goals tracking, ROI calculation
 */
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import Input from '../components/common/Input';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatters';

const getInvestmentIcon = (type) => {
  const icons = {
    stocks: 'trending-up',
    crypto: 'currency-bitcoin',
    'real-estate': 'home',
    bonds: 'account-balance',
    'mutual-funds': 'business',
    other: 'more-horiz',
  };
  return icons[type] || 'more-horiz';
};

const getInvestmentTypeLabel = (type) => {
  const labels = {
    stocks: 'Stocks',
    crypto: 'Crypto',
    'real-estate': 'Real Estate',
    bonds: 'Bonds',
    'mutual-funds': 'Mutual Funds',
    other: 'Other',
  };
  return labels[type] || 'Other';
};

const InvestmentScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const pad = width < 380 ? 16 : 20;
  
  const { settings, updateSettings } = useExpenses();
  const [investments, setInvestments] = useState(settings.investments || []);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', amount: 0, returns: 0, type: 'stocks', notes: '' });
  const [editingId, setEditingId] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setInvestments(settings.investments || []);
    }, [settings.investments])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const totalInvested = useMemo(() =>
    investments.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0),
    [investments]
  );

  const totalReturns = useMemo(() =>
    investments.reduce((sum, inv) => sum + (Number(inv.returns) || 0), 0),
    [investments]
  );

  const totalValue = totalInvested + totalReturns;
  const roiPercent = totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(2) : 0;

  const handleAddInvestment = () => {
    if (!formData.name.trim() || formData.amount <= 0) {
      alert('Please enter valid investment details');
      return;
    }
    const newInv = {
      id: editingId || Date.now().toString(),
      name: formData.name,
      amount: parseFloat(formData.amount),
      returns: parseFloat(formData.returns),
      date: new Date().toISOString(),
      type: formData.type || 'stocks', // Add investment type
      notes: formData.notes || '',
    };

    const updated = editingId
      ? investments.map(inv => inv.id === editingId ? newInv : inv)
      : [...investments, newInv];

    setInvestments(updated);
    updateSettings({ investments: updated });
    setFormData({ name: '', amount: 0, returns: 0, type: 'stocks', notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditInvestment = (inv) => {
    setFormData({
      name: inv.name,
      amount: inv.amount,
      returns: inv.returns,
      type: inv.type || 'stocks',
      notes: inv.notes || ''
    });
    setEditingId(inv.id);
    setShowForm(true);
  };

  const handleDeleteInvestment = (id) => {
    const updated = investments.filter(inv => inv.id !== id);
    setInvestments(updated);
    updateSettings({ investments: updated });
  };

  const currency = settings.currency || 'PHP';

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={s.safe} edges={['top']}>
        {/* Header */}
        <View style={[s.header, { paddingHorizontal: pad }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[s.backBtn, { backgroundColor: colors.surfaceSecondary }]}>
            <MaterialIcons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[s.title, { color: colors.text }]}>Investments 💼</Text>
          <View style={{ width: 42 }} />
        </View>

        <Animated.ScrollView
          contentContainerStyle={[s.scroll, { paddingHorizontal: pad }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {/* Summary Card */}
          <Animated.View style={[{ opacity: fadeAnim }]}>
            <Card style={[s.summaryCard, { backgroundColor: colors.surface }]}>
              <Text style={[s.cardLabel, { color: colors.textSecondary }]}>Total Portfolio</Text>
              <Text style={[s.cardAmount, { color: colors.text }]}>{formatCurrency(totalValue, currency)}</Text>
              
              <View style={s.statsRow}>
                <View>
                  <Text style={[s.statLabel, { color: colors.textTertiary }]}>Invested</Text>
                  <Text style={[s.statValue, { color: colors.text }]}>{formatCurrency(totalInvested, currency)}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[s.statLabel, { color: colors.textTertiary }]}>Returns</Text>
                  <Text style={[s.statValue, { color: totalReturns >= 0 ? '#43D9AD' : '#FF5252' }]}>
                    {formatCurrency(totalReturns, currency)}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[s.statLabel, { color: colors.textTertiary }]}>ROI</Text>
                  <Text style={[s.statValue, { color: roiPercent >= 0 ? '#43D9AD' : '#FF5252' }]}>
                    {roiPercent}%
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>

          {/* Add Investment Form */}
          {showForm && (
            <Card style={[s.formCard, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
              <Text style={[s.formTitle, { color: colors.text }]}>{editingId ? 'Edit' : 'Add'} Investment</Text>

              <Input
                label="Investment Name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="e.g., Apple Stock, Bitcoin, Real Estate"
                style={{ marginBottom: 12 }}
              />

              {/* Investment Type Selector */}
              <Text style={[s.inputLabel, { color: colors.textSecondary }]}>Investment Type</Text>
              <View style={s.typeSelector}>
                {[
                  { id: 'stocks', label: 'Stocks', icon: 'trending-up' },
                  { id: 'crypto', label: 'Crypto', icon: 'currency-bitcoin' },
                  { id: 'real-estate', label: 'Real Estate', icon: 'home' },
                  { id: 'bonds', label: 'Bonds', icon: 'account-balance' },
                  { id: 'mutual-funds', label: 'Mutual Funds', icon: 'business' },
                  { id: 'other', label: 'Other', icon: 'more-horiz' },
                ].map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    onPress={() => setFormData({ ...formData, type: type.id })}
                    style={[s.typeOption, formData.type === type.id && [s.activeType, { borderColor: colors.primary }]]}
                  >
                    <MaterialIcons
                      name={type.icon}
                      size={16}
                      color={formData.type === type.id ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[s.typeLabel, {
                      color: formData.type === type.id ? colors.primary : colors.textSecondary,
                      fontWeight: formData.type === type.id ? '600' : '400'
                    }]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Initial Amount"
                value={String(formData.amount)}
                onChangeText={(text) => setFormData({ ...formData, amount: parseFloat(text) || 0 })}
                placeholder="0.00"
                keyboardType="decimal-pad"
                style={{ marginBottom: 12 }}
              />

              <Input
                label="Current Returns/Gains"
                value={String(formData.returns)}
                onChangeText={(text) => setFormData({ ...formData, returns: parseFloat(text) || 0 })}
                placeholder="0.00"
                keyboardType="decimal-pad"
                style={{ marginBottom: 12 }}
              />

              <Input
                label="Notes (Optional)"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Additional notes..."
                multiline
                style={{ marginBottom: 16 }}
              />

              <View style={s.formBtns}>
                <Button
                  variant="secondary"
                  onPress={() => {
                    setShowForm(false);
                    setFormData({ name: '', amount: 0, returns: 0, type: 'stocks', notes: '' });
                    setEditingId(null);
                  }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
                <Button onPress={handleAddInvestment} style={{ flex: 1, marginLeft: 10 }}>
                  {editingId ? 'Update' : 'Add'}
                </Button>
              </View>
            </Card>
          )}

          {/* Investments List */}
          {investments.length > 0 ? (
            <View style={s.listContainer}>
              <Text style={[s.sectionTitle, { color: colors.text }]}>Your Investments</Text>
              {investments.map((inv) => {
                const gain = Number(inv.returns);
                const isPositive = gain >= 0;
                return (
                  <Card key={inv.id} style={[s.invCard, { backgroundColor: colors.card, borderColor: colors.separator }]}>
                    <View style={s.invHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.invName, { color: colors.text }]}>{inv.name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <MaterialIcons name={getInvestmentIcon(inv.type)} size={14} color={colors.primary} />
                          <Text style={[s.invType, { color: colors.textSecondary }]}>
                            {getInvestmentTypeLabel(inv.type)}
                          </Text>
                        </View>
                        <Text style={[s.invDate, { color: colors.textTertiary }]}>
                          {new Date(inv.date).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={s.invActions}>
                        <TouchableOpacity onPress={() => handleEditInvestment(inv)} style={s.actionBtn}>
                          <MaterialIcons name="edit" size={18} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteInvestment(inv.id)} style={s.actionBtn}>
                          <MaterialIcons name="delete" size={18} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={[s.invStats, { borderTopColor: colors.separator }]}>
                      <View>
                        <Text style={[s.invStatLabel, { color: colors.textSecondary }]}>Invested</Text>
                        <Text style={[s.invStatValue, { color: colors.text }]}>
                          {formatCurrency(inv.amount, currency)}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={[s.invStatLabel, { color: colors.textSecondary }]}>Returns</Text>
                        <Text style={[s.invStatValue, { color: isPositive ? '#43D9AD' : '#FF5252' }]}>
                          {formatCurrency(gain, currency)}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[s.invStatLabel, { color: colors.textSecondary }]}>Total Value</Text>
                        <Text style={[s.invStatValue, { color: colors.text }]}>
                          {formatCurrency(inv.amount + gain, currency)}
                        </Text>
                      </View>
                    </View>
                  </Card>
                );
              })}
            </View>
          ) : (
            !showForm && (
              <EmptyState
                icon="trending-up"
                title="No investments yet 📈"
                subtitle="Start building your investment portfolio!"
              />
            )
          )}

          <View style={{ height: 40 }} />
        </Animated.ScrollView>

        {/* FAB */}
        {!showForm && (
          <TouchableOpacity
            onPress={() => setShowForm(true)}
            style={[s.fab, { backgroundColor: colors.primary }]}
          >
            <MaterialIcons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  backBtn: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800', flex: 1, textAlign: 'center' },
  scroll: { paddingTop: 6, paddingBottom: 20 },
  
  summaryCard: { borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1 },
  cardLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4, letterSpacing: 0.5 },
  cardAmount: { fontSize: 28, fontWeight: '800', marginBottom: 14, letterSpacing: -0.5 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  statLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: '800' },

  formCard: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  formTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  typeSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'transparent', gap: 6 },
  activeType: { backgroundColor: 'rgba(108, 99, 255, 0.1)' },
  typeLabel: { fontSize: 12 },
  formBtns: { flexDirection: 'row', gap: 10 },

  listContainer: { marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 12, letterSpacing: -0.3 },

  invCard: { borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1 },
  invHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  invName: { fontSize: 15, fontWeight: '700' },
  invType: { fontSize: 11, fontWeight: '500' },
  invDate: { fontSize: 11, marginTop: 2 },
  invActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  invStats: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1 },
  invStatLabel: { fontSize: 10, fontWeight: '600', marginBottom: 2 },
  invStatValue: { fontSize: 13, fontWeight: '800' },

  fab: { position: 'absolute', bottom: 24, right: 20, width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', elevation: 12, shadowOffset: { width: 0, height: 8 }, shadowRadius: 20, shadowOpacity: 0.45 },
});

export default InvestmentScreen;
