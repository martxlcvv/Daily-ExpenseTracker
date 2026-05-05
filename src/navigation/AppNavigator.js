import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import DeleteHistoryScreen from '../screens/DeleteHistoryScreen';
import PlannedPaymentsScreen from '../screens/PlannedPaymentsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

function InnerNavigator() {
  const { colors, isDark } = useTheme();

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.secondary,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Home" component={TabNavigator} />
        <Stack.Screen
          name="AddExpense"
          component={AddExpenseScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="DeleteHistory" component={DeleteHistoryScreen} />
        <Stack.Screen name="ShoppingList" component={ShoppingListScreen} />
        <Stack.Screen name="PlannedPayments" component={PlannedPaymentsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function AppNavigator() {
  return <InnerNavigator />;
}
