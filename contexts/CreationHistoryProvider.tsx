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

const MAX_HISTORY_ITEMS = 20;

export const CreationHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<CreationHistoryItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.warn('Aborting history fetch due to timeout (10 seconds).');
          controller.abort();
        }, 10000); // 10-second timeout

        try {
          // --- Two-step query optimization to avoid timeouts on throttled databases ---
          
          // Step 1: Fetch only the IDs of the most recent items.
          const { data: idData, error: idError } = await supabase
            .from('creations')
            .select('id')
            .eq('user_id', user.id)
            .order('timestamp', { ascending: false })
            .limit(MAX_HISTORY_ITEMS)
            .abortSignal(controller.signal);

          if (idError) throw idError;
          if (!idData || idData.length === 0) {
            setHistory([]);
            return;
          }

          // Step 2: Fetch the full data for only those specific IDs.
          const ids = idData.map(item => item.id);
          const { data, error } = await supabase
            .from('creations')
            .select('id, user_id, tool, timestamp, result')
            .in('id', ids)
            .order('timestamp', { ascending: false })
            .abortSignal(controller.signal);

          if (error) throw error;
          
          const validData = data ? data.filter(item => item.result != null) : [];
          
          const mappedHistory: CreationHistoryItem[] = validData.map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            tool: item.tool,
            timestamp: new Date(item.timestamp).getTime(),
            result: item.result,
          }));

          setHistory(mappedHistory);
        } catch (error) {
          if (error.name === 'AbortError' || (error.message && error.message.includes('timeout'))) {
            console.warn('Could not fetch creation history due to timeout. This may be due to platform usage limits.');
          } else {
            console.error("Error fetching creation history:", JSON.stringify(error, null, 2));
          }
          setHistory([]);
        } finally {
            clearTimeout(timeoutId);
        }
      } else {
        setHistory([]);
      }
    };
    fetchHistory();
  }, [user]);

  const addCreation = useCallback((tool: Tool, result: CreationResult): CreationHistoryItem => {
    if (!user) {
        throw new Error("Cannot add creation: no user is signed in.");
    }
    
    // Use a more unique temporary ID for optimistic updates
    const tempId = `temp_${Date.now()}`;
    const newCreation: CreationHistoryItem = {
      id: tempId,
      user_id: user.id,
      tool,
      timestamp: Date.now(),
      result,
    };
    
    // Optimistically update the UI
    setHistory(prevHistory => [newCreation, ...prevHistory].slice(0, MAX_HISTORY_ITEMS));

    // Asynchronously insert into DB and then sync the real ID back to the UI state
    const syncWithDb = async () => {
        try {
            const { data, error } = await supabase.from('creations').insert({
                user_id: newCreation.user_id,
                tool: newCreation.tool,
                result: newCreation.result, // The result now contains URLs, so it's safe to store directly.
            }).select('id').single();

            if (error) throw error;
            
            // Post-insert: Update the temporary item in state with the real ID from the DB
            if (data) {
                setHistory(prev => prev.map(item =>
                    item.id === tempId ? { ...item, id: data.id } : item
                ));
            }
        } catch(error) {
            console.error("Failed to save creation to database:", error);
            // On failure, revert the optimistic update
            setHistory(prev => prev.filter(item => item.id !== tempId));
        }
    };
    
    syncWithDb();

    // Return the item with the temporary ID for immediate use in the UI
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
