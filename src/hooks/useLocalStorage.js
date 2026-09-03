// src/hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

/**
 * Custom Hook: useLocalStorage
 * Demonstrates state persistence using browser localStorage.
 * Initializes state from localStorage if available, and synchronizes state updates.
 */
export function useLocalStorage(key, initialValue) {
  // Read initial value from localStorage or fallback to default
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Sync state to localStorage whenever value or key changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
