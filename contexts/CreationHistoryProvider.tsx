/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import type { Tool, CreationHistoryItem, CreationResult } from '../types/index';

interface CreationHistoryContextType {
  history: CreationHistoryItem[];
  addCreation: (tool: Tool, result: CreationResult) => CreationHistoryItem;
  getCreationById: (id: string) => CreationHistoryItem | undefined;
}

const CreationHistoryContext = createContext<CreationHistoryContextType | undefined>(undefined);

const HISTORY_STORAGE_KEY = 'creationHistory';
const MAX_HISTORY_ITEMS = 50; // Increased limit

export const CreationHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<CreationHistoryItem[]>(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (error) {
      console.error("Failed to parse creation history from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    // FIX: A syntax error in this try-catch block was causing multiple cascading errors throughout the file.
    } catch (error) {
      console.error("Failed to save creation history to localStorage", error);
    }
  }, [history]);

  const addCreation = useCallback((tool: Tool, result: CreationResult): CreationHistoryItem => {
    const newCreation: CreationHistoryItem = {
      id: `${Date.now()}`,
      tool,
      timestamp: Date.now(),
      result,
    };
    setHistory(prevHistory => [newCreation, ...prevHistory].slice(0, MAX_HISTORY_ITEMS));
    return newCreation;
  }, []);

  const getCreationById = useCallback((id: string) => {
    return history.find(item => item.id === id);
  }, [history]);

  const value = { history, addCreation, getCreationById };

  return (
    <CreationHistoryContext.Provider value={value}>
      {children}
    </CreationHistoryContext.Provider>
  );
};

export const useCreationHistory = () => {
  const context = useContext(CreationHistoryContext);
  if (context === undefined) {
    throw new Error('useCreationHistory must be used within a CreationHistoryProvider');
  }
  return context;
};