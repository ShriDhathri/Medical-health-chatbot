"use client";

import { useState, useEffect, useCallback } from 'react';

// This is needed to prevent dependency on a client-only library on the server
let anId = 0
try {
  const { v4 } = require('uuid');
  anId = v4();
} catch (e) {}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    // This runs only on the client
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      } else {
        window.localStorage.setItem(key, JSON.stringify(initialValue));
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.log(error);
      setStoredValue(initialValue);
    }
  }, [key]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}
