/**
 * ShoppingListScreen.js — Improved with:
 *  • Default + custom categories
 *  • Category assignment per item
 *  • Date tagging per item
 *  • Swipe/tap to check off items
 *  • Keyboard does NOT auto-close (keyboardShouldPersistTaps)
 */
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, Layout, Spacing } from '../theme/spacing';
import { FontSize, FontWeight } from '../theme/typography';

// ── Default categories ──────────────────────────────────────────────────────
const DEFAULT_CATEGORIES = [
  { id: 'grocery',   label: 'Grocery',   icon: 'local-grocery-store', color: '#43D9AD' },
  { id: 'personal',  label: 'Personal',  icon: 'person',              color: '#7C75FF' },
  { id: 'household', label: 'Household', icon: 'home',                color: '#FFB347' },
  { id: 'health',    label: 'Health',    icon: 'favorite',            color: '#FF6B6B' },
  { id: 'tech',      label: 'Tech',      icon: 'devices',             color: '#4FC3F7' },
  { id: 'other',     label: 'Other',     icon: 'category',            color: '#A0AEC0' },
];

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ── Category pill row ────────────────────────────────────────────────────────
const CategoryPicker = ({ categories, selected, onSelect }) => {
  const { colors } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginBottom: Spacing.md }}
      contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
      keyboardShouldPersistTaps="always"
    >
      {categories.map((cat) => {
        const active = selected === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            style={[
              styles.catPill,
              {
                backgroundColor: active ? cat.color + '28' : colors.surfaceSecondary,
                borderColor:     active ? cat.color        : 'transparent',
              },
            ]}
          >
            <MaterialIcons name={cat.icon} size={13} color={active ? cat.color : colors.textSecondary} />
            <Text style={[styles.catPillLabel, { color: active ? cat.color : colors.textSecondary, fontWeight: active ? '700' : '500' }]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default function ShoppingListScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { settings, addShoppingItem, removeShoppingItem, updateShoppingItem } = useExpenses();

  const [itemText,      setItemText]      = useState('');
  const [selectedCat,   setSelectedCat]   = useState('grocery');
  const [dueDate,        setDueDate]       = useState('');
  const [customCatName,  setCustomCatName] = useState('');
  const [showAddCat,     setShowAddCat]    = useState(false);
  const [filterCat,      setFilterCat]     = useState('all');

  // Merge default + user-defined categories
  const userCategories = settings.shoppingCategories || [];
  const allCategories  = [...DEFAULT_CATEGORIES, ...userCategories];

  const items = settings.shoppingList || [];

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAddItem = async () => {
    if (!itemText.trim()) {
      Alert.alert('Add Item', 'Please enter an item name.');
      return;
    }
    const cat = allCategories.find((c) => c.id === selectedCat) || allCategories[0];
    await addShoppingItem({
      name:     itemText.trim(),
      category: selectedCat,
      catLabel: cat.label,
      catColor: cat.color,
      catIcon:  cat.icon,
      dueDate:  dueDate.trim() || new Date().toISOString().split('T')[0],
      checked:  false,
    });
    setItemText('');
    setDueDate('');
  };

  const handleAddCustomCategory = async () => {
    if (!customCatName.trim()) return;
    const newCat = {
      id:    customCatName.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
      label: customCatName.trim(),
      icon:  'label',
      color: '#' + Math.floor(Math.random() * 0xAAAAAA + 0x555555).toString(16),
    };
    const existing = settings.shoppingCategories || [];
    // updateSettings from ExpenseContext
    await updateShoppingItem?.('__categories__', [...existing, newCat]);
    setCustomCatName('');
    setShowAddCat(false);
    setSelectedCat(newCat.id);
  };

  const handleToggleCheck = async (item) => {
    const updated = { ...item, checked: !item.checked };
    await updateShoppingItem?.(item.id, updated);
  };

  const handleRemove = (itemId) => {
    Alert.alert('Remove Item', 'Delete this item from your list?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeShoppingItem(itemId) },
    ]);
  };

  // Grouped display
  const filteredItems = filterCat === 'all'
    ? items
    : items.filter((i) => i.category === filterCat);

  const checkedItems   = filteredItems.filter((i) => i.checked);
  const uncheckedItems = filteredItems.filter((i) => !i.checked);

  const renderItem = (item) => {
    const catColor = item.catColor || '#A0AEC0';
    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.78}
        onPress={() => handleToggleCheck(item)}
        style={[
          styles.itemCard,
          {
            backgroundColor: item.checked ? colors.surfaceSecondary : colors.card,
            borderLeftColor: catColor,
            borderColor:     colors.cardBorder,
          },
        ]}
      >
        {/* Checkbox */}
        <View style={[
          styles.checkbox,
          {
            borderColor:     catColor,
            backgroundColor: item.checked ? catColor : 'transparent',
          },
        ]}>
          {item.checked && <MaterialIcons name="check" size={13} color="#FFFFFF" />}
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text style={[
            styles.itemName,
            { color: item.checked ? colors.textTertiary : colors.text,
              textDecorationLine: item.checked ? 'line-through' : 'none' },
          ]}>
            {item.name}
          </Text>
          <View style={styles.itemMeta}>
            <MaterialIcons name={item.catIcon || 'label'} size={11} color={catColor} />
            <Text style={[styles.itemMetaText, { color: colors.textSecondary }]}>
              {item.catLabel || 'Other'}
            </Text>
            {item.dueDate ? (
              <>
                <Text style={{ color: colors.textTertiary, fontSize: 11 }}>•</Text>
                <MaterialIcons name="event" size={11} color={colors.textTertiary} />
                <Text style={[styles.itemMetaText, { color: colors.textTertiary }]}>
                  {formatDate(item.dueDate)}
                </Text>
              </>
            ) : null}
          </View>
        </View>

        {/* Delete */}
        <TouchableOpacity
          onPress={() => handleRemove(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="close" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.separator }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]}
          >
            <MaterialIcons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Shopping List</Text>
          <View style={{ width: 38 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Add item card ─────────────────────────────────── */}
            <Card style={styles.addCard} elevation="sm">
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Add new item</Text>

              <Input
                value={itemText}
                onChangeText={setItemText}
                placeholder="Item name"
                icon="shopping-cart"
                returnKeyType="done"
                onSubmitEditing={handleAddItem}
                blurOnSubmit={false}
                style={{ marginBottom: Spacing.sm }}
              />

              {/* Category picker */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Category</Text>
              <CategoryPicker
                categories={allCategories}
                selected={selectedCat}
                onSelect={setSelectedCat}
              />

              {/* Date */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Due / Buy Date (YYYY-MM-DD)</Text>
              <Input
                value={dueDate}
                onChangeText={setDueDate}
                placeholder={new Date().toISOString().split('T')[0]}
                icon="event"
                keyboardType="numbers-and-punctuation"
                blurOnSubmit={false}
                style={{ marginBottom: Spacing.md }}
              />

              <TouchableOpacity
                onPress={handleAddItem}
                style={[styles.addBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.85}
              >
                <MaterialIcons name="add" size={18} color="#FFF" />
                <Text style={styles.addBtnLabel}>Add to List</Text>
              </TouchableOpacity>

              {/* Custom category */}
              <TouchableOpacity
                onPress={() => setShowAddCat(!showAddCat)}
                style={styles.addCatToggle}
              >
                <MaterialIcons name={showAddCat ? 'expand-less' : 'add-circle-outline'} size={16} color={colors.primary} />
                <Text style={[styles.addCatToggleLabel, { color: colors.primary }]}>
                  {showAddCat ? 'Cancel' : 'Create custom category'}
                </Text>
              </TouchableOpacity>

              {showAddCat && (
                <View style={styles.addCatRow}>
                  <Input
                    value={customCatName}
                    onChangeText={setCustomCatName}
                    placeholder="Category name"
                    icon="label"
                    style={{ flex: 1, marginBottom: 0 }}
                    blurOnSubmit={false}
                    returnKeyType="done"
                    onSubmitEditing={handleAddCustomCategory}
                  />
                  <TouchableOpacity
                    onPress={handleAddCustomCategory}
                    style={[styles.saveSmallBtn, { backgroundColor: colors.primary }]}
                  >
                    <MaterialIcons name="check" size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              )}
            </Card>

            {/* ── Filter by category ─────────────────────────────── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              contentContainerStyle={styles.filterRow}
            >
              {[{ id: 'all', label: 'All', color: colors.primary }, ...allCategories].map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setFilterCat(cat.id)}
                  style={[
                    styles.filterPill,
                    { backgroundColor: filterCat === cat.id ? (cat.color || colors.primary) : colors.surfaceSecondary },
                  ]}
                >
                  <Text style={[styles.filterPillLabel, {
                    color: filterCat === cat.id ? '#FFF' : colors.textSecondary,
                    fontWeight: filterCat === cat.id ? '700' : '500',
                  }]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* ── To-buy items ──────────────────────────────────── */}
            {uncheckedItems.length > 0 && (
              <>
                <View style={styles.listSectionHeader}>
                  <Text style={[styles.listSectionLabel, { color: colors.text }]}>
                    To Buy ({uncheckedItems.length})
                  </Text>
                </View>
                {uncheckedItems.map(renderItem)}
              </>
            )}

            {/* ── Done items ─────────────────────────────────────── */}
            {checkedItems.length > 0 && (
              <>
                <View style={styles.listSectionHeader}>
                  <Text style={[styles.listSectionLabel, { color: colors.textSecondary }]}>
                    Done ({checkedItems.length})
                  </Text>
                </View>
                {checkedItems.map(renderItem)}
              </>
            )}

            {filteredItems.length === 0 && (
              <View style={styles.empty}>
                <MaterialIcons name="shopping-bag" size={40} color={colors.textTertiary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {filterCat === 'all' ? 'No items yet. Add something above.' : 'No items in this category.'}
                </Text>
              </View>
            )}

            <View style={{ height: 60 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1 },
  safe:  { flex: 1 },
  scroll:{ padding: Layout.screenPadding, paddingTop: 12 },
  header:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  backButton:{
    width: 38, height: 38,
    borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  title:{ fontSize: FontSize.xl, fontWeight: FontWeight.bold },

  addCard:{ marginBottom: Spacing.md, padding: Spacing.md },
  sectionTitle:{ fontSize: FontSize.base, fontWeight: FontWeight.semiBold, marginBottom: Spacing.sm },
  fieldLabel:{ fontSize: FontSize.xs, fontWeight: '600', marginBottom: 4, letterSpacing: 0.3 },
  addBtn:{
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 11, borderRadius: BorderRadius.md,
  },
  addBtnLabel:{ color: '#FFF', fontWeight: '700', fontSize: FontSize.base },
  addCatToggle:{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm, paddingVertical: 4 },
  addCatToggleLabel:{ fontSize: FontSize.sm, fontWeight: '600' },
  addCatRow:{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Spacing.sm },
  saveSmallBtn:{
    width: 44, height: 50, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center',
  },

  catPill:{
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: BorderRadius.full, borderWidth: 1.5,
  },
  catPillLabel:{ fontSize: 12 },

  filterRow:{ gap: 8, paddingBottom: Spacing.sm, paddingTop: 4 },
  filterPill:{
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  filterPillLabel:{ fontSize: FontSize.xs },

  listSectionHeader:{ marginBottom: Spacing.xs, marginTop: Spacing.md },
  listSectionLabel:{ fontSize: FontSize.sm, fontWeight: '700', letterSpacing: 0.2 },

  itemCard:{
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    elevation: 1,
    shadowOffset:{ width: 0, height: 1 },
    shadowRadius: 3,
    shadowOpacity: 0.06,
  },
  checkbox:{
    width: 22, height: 22,
    borderRadius: 6, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  itemName:{ fontSize: FontSize.base, fontWeight: FontWeight.medium, marginBottom: 2 },
  itemMeta:{ flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemMetaText:{ fontSize: 11, fontWeight: '500' },

  empty:{ alignItems: 'center', paddingTop: 40, gap: 10 },
  emptyText:{ fontSize: FontSize.sm, textAlign: 'center' },
});