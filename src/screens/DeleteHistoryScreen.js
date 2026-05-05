import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
  Alert,
  Animated,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExpenses } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';
import { bulkDeleteExpenses, clearDeleteHistory, getDeleteHistory } from '../services/StorageService';
import { BorderRadius, Layout, Shadow, Spacing } from '../theme/spacing';
import { FontSize, FontWeight } from '../theme/typography';
import { getCategoryById } from '../utils/categories';
import { formatDateFull, formatTime } from '../utils/formatters';

const DeleteHistoryScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { restoreExpense } = useExpenses();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const fadeAnim = new Animated.Value(0);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getDeleteHistory();
      setHistory(data || []);
    } catch (e) {
      console.error('Error loading history:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) {
      setSelectedIds(new Set());
    }
  };

  const toggleItemSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === history.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(history.map(e => e.id)));
    }
  };

  const handleRestore = (expense) => {
    Alert.alert(
      'Restore Expense',
      `Restore ₱${expense.amount.toFixed(2)} from ${getCategoryById(expense.category).name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            const restored = await restoreExpense(expense.id);
            if (restored) {
              await loadHistory();
              Alert.alert('Success', 'Expense restored successfully!');
            } else {
              Alert.alert('Error', 'Unable to restore this expense.');
            }
          },
        },
      ]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) {
      Alert.alert('No Selection', 'Please select items to delete');
      return;
    }

    Alert.alert(
      'Delete Selected Items',
      `Permanently delete ${selectedIds.size} item(s)? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await bulkDeleteExpenses(Array.from(selectedIds));
              setSelectedIds(new Set());
              setIsSelectMode(false);
              loadHistory();
              Alert.alert('Success', `${selectedIds.size} item(s) deleted permanently.`);
            } catch (e) {
              Alert.alert('Error', 'Failed to delete items');
            }
          },
        },
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear All History',
      'Are you sure? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearDeleteHistory();
            setHistory([]);
            Alert.alert('Done', 'Delete history cleared.');
          },
        },
      ]
    );
  };

  const hasSelected = selectedIds.size > 0;
  const isAllSelected = selectedIds.size === history.length && history.length > 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.separator, backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={[styles.title, { color: colors.text }]}>Delete History</Text>
            {isSelectMode && hasSelected && (
              <Text style={[styles.selectedCount, { color: colors.primary }]}>
                {selectedIds.size} selected
              </Text>
            )}
          </View>
          <View style={styles.headerActions}>
            {history.length > 0 && (
              <>
                <TouchableOpacity onPress={toggleSelectMode} style={styles.iconBtn}>
                  <MaterialIcons 
                    name={isSelectMode ? 'close' : 'check-box'} 
                    size={24} 
                    color={isSelectMode ? colors.danger : colors.primary} 
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleClearHistory} style={styles.iconBtn}>
                  <MaterialIcons name="delete-sweep" size={24} color={colors.danger} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <MaterialIcons name="history" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Loading...</Text>
          </View>
        ) : history.length === 0 ? (
          <View style={styles.centerContainer}>
            <MaterialIcons name="check-circle" size={48} color={colors.success} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No deleted expenses</Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
              Deleted items will appear here
            </Text>
          </View>
        ) : (
          <>
            <ScrollView
              contentContainerStyle={styles.scroll}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
              {isSelectMode && (
                <View style={[styles.selectAllBar, { backgroundColor: colors.card, borderBottomColor: colors.separator }]}>
                  <TouchableOpacity
                    onPress={toggleSelectAll}
                    style={styles.selectAllBtn}
                  >
                    <View style={[
                      styles.checkbox,
                      {
                        backgroundColor: isAllSelected ? colors.primary : 'transparent',
                        borderColor: colors.primary,
                      }
                    ]}>
                      {isAllSelected && (
                        <MaterialIcons name="check" size={16} color="white" />
                      )}
                    </View>
                    <Text style={[styles.selectAllText, { color: colors.text }]}>
                      {isAllSelected ? 'Deselect All' : 'Select All'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {history.map((expense) => {
                const category = getCategoryById(expense.category);
                const iconBg = isDark ? category.darkColor : category.lightColor;
                const isSelected = selectedIds.has(expense.id);

                return (
                  <View
                    key={expense.id}
                    style={[
                      styles.item,
                      {
                        backgroundColor: isSelected ? colors.primary + '15' : colors.card,
                        borderColor: isSelected ? colors.primary : colors.cardBorder,
                        borderWidth: isSelected ? 2 : 1,
                        ...Shadow.sm,
                        shadowColor: colors.shadow,
                      },
                    ]}
                  >
                    {isSelectMode && (
                      <TouchableOpacity
                        onPress={() => toggleItemSelect(expense.id)}
                        style={styles.checkboxWrapper}
                      >
                        <View style={[
                          styles.checkbox,
                          {
                            backgroundColor: isSelected ? colors.primary : 'transparent',
                            borderColor: colors.primary,
                          }
                        ]}>
                          {isSelected && (
                            <MaterialIcons name="check" size={14} color="white" />
                          )}
                        </View>
                      </TouchableOpacity>
                    )}

                    <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                      <MaterialIcons name={category.icon} size={24} color={category.color} />
                    </View>

                    <View style={styles.info}>
                      <Text style={[styles.category, { color: colors.text }]} numberOfLines={1}>
                        {category.name}
                      </Text>
                      {expense.note && (
                        <Text style={[styles.note, { color: colors.textSecondary }]} numberOfLines={1}>
                          {expense.note}
                        </Text>
                      )}
                      <Text style={[styles.date, { color: colors.textTertiary }]}>
                        {formatDateFull(new Date(expense.date))} at {formatTime(expense.date)}
                      </Text>
                    </View>

                    <View style={styles.rightSection}>
                      <Text style={[styles.amount, { color: colors.text }]}>
                        ₱{expense.amount.toFixed(2)}
                      </Text>
                      {!isSelectMode && (
                        <TouchableOpacity
                          onPress={() => handleRestore(expense)}
                          style={[styles.restoreBtn, { backgroundColor: colors.primary + '20' }]}
                        >
                          <MaterialIcons name="restore" size={18} color={colors.primary} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}

              <View style={{ height: Spacing.xl }} />
            </ScrollView>

            {isSelectMode && hasSelected && (
              <LinearGradient
                colors={[colors.primary + '00', colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.bulkActionBar}
              >
                <TouchableOpacity
                  onPress={handleBulkDelete}
                  style={[styles.bulkDeleteBtn, { backgroundColor: colors.danger }]}
                >
                  <MaterialIcons name="delete" size={20} color="white" />
                  <Text style={styles.bulkDeleteText}>
                    Delete {selectedIds.size} Item{selectedIds.size !== 1 ? 's' : ''}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
          </>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  selectedCount: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: Layout.screenPadding,
  },
  selectAllBar: {
    borderBottomWidth: 1,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  checkboxWrapper: {
    marginRight: Spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  category: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
  },
  note: {
    fontSize: FontSize.sm,
  },
  date: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  amount: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  restoreBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectAllText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
  },
  bulkActionBar: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  bulkDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  bulkDeleteText: {
    color: 'white',
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
  },
  clearBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DeleteHistoryScreen;
