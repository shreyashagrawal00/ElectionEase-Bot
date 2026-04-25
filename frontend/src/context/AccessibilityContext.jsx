import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default to true for premium feel
  const [fontSize, setFontSize] = useState('medium');

  useEffect(() => {
    // Apply high contrast styling (can map to tailwind class)
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    // Apply font size class 
    document.documentElement.classList.remove('text-small', 'text-medium', 'text-large');
    document.documentElement.classList.add(`text-${fontSize}`);
  }, [fontSize]);

  const toggleHighContrast = () => setHighContrast(!highContrast);
  const toggleDarkMode = () => setDarkMode(!darkMode);
  
  return (
    <AccessibilityContext.Provider value={{ 
      highContrast, toggleHighContrast, 
      darkMode, toggleDarkMode,
      fontSize, setFontSize 
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};
