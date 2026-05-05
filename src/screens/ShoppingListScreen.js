import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
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

export default function ShoppingListScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { settings, addShoppingItem, removeShoppingItem } = useExpenses();
  const [itemText, setItemText] = useState('');

  const handleAddItem = async () => {
    if (!itemText.trim()) {
      Alert.alert('Add Item', 'Please enter an item name.');
      return;
    }

    await addShoppingItem(itemText.trim());
    setItemText('');
  };

  const handleRemoveItem = (itemId) => {
    removeShoppingItem(itemId);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}> 
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}> 
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}> 
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Shopping List</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card style={styles.card} elevation="sm"> 
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Add new item</Text>
            <View style={styles.inputRow}> 
              <Input
                value={itemText}
                onChangeText={setItemText}
                placeholder="Enter item name"
                icon="shopping-cart"
                style={{ flex: 1 }}
              />
              <TouchableOpacity
                onPress={handleAddItem}
                style={[styles.addButton, { backgroundColor: colors.primary }]}
              >
                <MaterialIcons name="add" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Card>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>My items</Text>
          {(settings.shoppingList || []).length > 0 ? (
            (settings.shoppingList || []).map((item) => (
              <Card key={item.id} style={styles.itemCard} elevation="sm"> 
                <View style={styles.itemRow}>
                  <Text style={[styles.itemText, { color: colors.text }]}>{item.name}</Text>
                  <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                    <MaterialIcons name="delete" size={22} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No shopping items yet.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: Layout.screenPadding },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  card: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  itemCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
  },
  emptyText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
