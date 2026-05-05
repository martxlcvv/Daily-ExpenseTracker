import { useEffect, useState } from 'react';
import SplashScreen from './src/components/SplashScreen';
import { ExpenseProvider, useExpenses } from './src/context/ExpenseContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingScreen from './src/screens/SplashScreen';

function AppContent() {
  const { loading } = useExpenses();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (loading) {
    return <LoadingScreen message="Loading your expenses..." />;
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <ThemeProvider>
      <ExpenseProvider>
        <AppContent />
      </ExpenseProvider>
    </ThemeProvider>
  );
}