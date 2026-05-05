import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { getSettings, updateSetting } from '../services/StorageService';
import { Colors } from '../theme/colors';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const settings = await getSettings();
      setIsDark(settings.darkMode ?? true);
      setLoaded(true);
    })();
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await updateSetting('darkMode', next);
  };

  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors, loaded }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};