/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import type { Tool, CreationHistoryItem, CreationResult } from '../types/index';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthProvider';

interface CreationHistoryContextType {
  history: CreationHistoryItem[];
  addCreation: (tool: Tool, result: CreationResult) => CreationHistoryItem;
  getCreationById: (id: string) => CreationHistoryItem | undefined;
}

const CreationHistoryContext = createContext<CreationHistoryContextType | undefined>(undefined);

const MAX_HISTORY_ITEMS = 50;

export const CreationHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<CreationHistoryItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('creations')
            .select('*')
            .eq('user_id', user.id)
            .order('timestamp', { ascending: false })
            .limit(MAX_HISTORY_ITEMS);

          if (error) throw error;
          setHistory(data as CreationHistoryItem[]);
        } catch (error) {
          console.error("Error fetching creation history:", error);
          setHistory([]);
        }
      } else {
        // Clear history when user logs out
        setHistory([]);
      }
    };
    fetchHistory();
  }, [user]);

  const addCreation = useCallback((tool: Tool, result: CreationResult): CreationHistoryItem => {
    if (!user) {
        // This should not happen if the UI is correctly blocking access, but as a safeguard:
        throw new Error("Cannot add creation: no user is signed in.");
    }
    
    // Create the object for immediate UI update
    const newCreation: CreationHistoryItem = {
      id: `${Date.now()}`, // Temporary ID, will be replaced by DB ID if needed
      user_id: user.id,
      tool,
      timestamp: Date.now(),
      result,
    };
    
    // Optimistically update the UI
    setHistory(prevHistory => [newCreation, ...prevHistory].slice(0, MAX_HISTORY_ITEMS));

    // Asynchronously insert into the database
    const insertToDB = async () => {
        try {
            // We can't know the real DB ID without a round trip, so we insert and re-fetch if needed.
            // For this app, just inserting is fine. The optimistic update is the main thing.
            const { error } = await supabase.from('creations').insert({
                // Supabase will generate the 'id'
                user_id: newCreation.user_id,
                tool: newCreation.tool,
                timestamp: new Date(newCreation.timestamp).toISOString(),
                result: newCreation.result,
            });
            if (error) throw error;
        } catch(error) {
            console.error("Failed to save creation to database:", error);
            // Optional: implement logic to revert the optimistic update
        }
    };
    insertToDB();

    return newCreation;
  }, [user]);

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