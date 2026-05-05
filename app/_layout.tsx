import { ExpenseProvider } from '@/src/context/ExpenseContext';
import AppNavigator from '@/src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: 'Home',
};

export default function RootLayout() {
  return (
    <ExpenseProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </ExpenseProvider>
  );
}
