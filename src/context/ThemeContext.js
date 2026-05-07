import { createContext, useContext, useEffect, useState } from 'react';
import { getSettings, updateSetting } from '../services/StorageService';
import { Colors } from '../theme/colors';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark]   = useState(true);
  const [loaded, setLoaded]   = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const settings = await getSettings();
        setIsDark(settings.darkMode ?? true);
      } catch (e) {
        // keep default dark
      } finally {
        setLoaded(true);
      }
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
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};