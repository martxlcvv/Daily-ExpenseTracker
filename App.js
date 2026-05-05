import { useState } from 'react';
import { View } from 'react-native';
import SplashScreen from './src/components/SplashScreen';
import { ExpenseProvider } from './src/context/ExpenseContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <ThemeProvider>
      <ExpenseProvider>
        {showSplash ? (
          <View style={{ flex: 1 }}>
            <SplashScreen onFinish={() => setShowSplash(false)} />
          </View>
        ) : (
          <AppNavigator />
        )}
      </ExpenseProvider>
    </ThemeProvider>
  );
}