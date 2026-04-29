import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AccessibilityContext = createContext(null);

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used inside <AccessibilityProvider>');
  return ctx;
};

/**
 * Reads a preference from localStorage with a safe fallback.
 * @param {string} key
 * @param {*} fallback
 */
const readPref = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

/**
 * @context AccessibilityProvider
 * @description Manages and persists user accessibility preferences.
 * Applies the following classes to <html>:
 *  - `dark`          — dark colour scheme
 *  - `high-contrast` — WCAG AA high-contrast overrides
 *  - `text-small`    — reduced base font size (14px)
 *  - `text-medium`   — default base font size (16px)
 *  - `text-large`    — enlarged base font size (18px)
 *
 * All preferences are persisted to localStorage so they
 * survive page refreshes without a server round-trip.
 */
export const AccessibilityProvider = ({ children }) => {
  const [darkMode,      setDarkMode]      = useState(() => readPref('pref_darkMode',      true));
  const [highContrast,  setHighContrast]  = useState(() => readPref('pref_highContrast',  false));
  const [fontSize,      setFontSize]      = useState(() => readPref('pref_fontSize',      'medium'));
  const [reduceMotion,  setReduceMotion]  = useState(() => readPref('pref_reduceMotion',  false));

  // ── Apply dark mode ─────────────────────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', darkMode);
    // Update meta theme-color for mobile browsers
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.content = darkMode ? '#050810' : '#ffffff';
    localStorage.setItem('pref_darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // ── Apply high contrast ─────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
    localStorage.setItem('pref_highContrast', JSON.stringify(highContrast));
  }, [highContrast]);

  // ── Apply font size ─────────────────────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-small', 'text-medium', 'text-large');
    root.classList.add(`text-${fontSize}`);
    localStorage.setItem('pref_fontSize', JSON.stringify(fontSize));
  }, [fontSize]);

  // ── Apply reduce motion ─────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
    localStorage.setItem('pref_reduceMotion', JSON.stringify(reduceMotion));
  }, [reduceMotion]);

  // ── Also respect the OS-level preference on first load ──────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches && !readPref('pref_reduceMotion', false)) {
      setReduceMotion(true);
    }
    // Listen for OS preference changes
    const handler = (e) => setReduceMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleDarkMode     = useCallback(() => setDarkMode((v) => !v), []);
  const toggleHighContrast = useCallback(() => setHighContrast((v) => !v), []);
  const toggleReduceMotion = useCallback(() => setReduceMotion((v) => !v), []);

  return (
    <AccessibilityContext.Provider value={{
      darkMode,      toggleDarkMode,
      highContrast,  toggleHighContrast,
      fontSize,      setFontSize,
      reduceMotion,  toggleReduceMotion,
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};
