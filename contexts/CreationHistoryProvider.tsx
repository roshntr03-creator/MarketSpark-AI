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
        try {
          // Step 1: Fetch metadata first for a fast initial load.
          const { data: metadata, error: metadataError } = await supabase
            .from('creations')
            .select('id, user_id, tool, timestamp') // Omit the large 'result' column
            .eq('user_id', user.id)
            .order('timestamp', { ascending: false })
            .limit(MAX_HISTORY_ITEMS);

          if (metadataError) throw metadataError;

          const initialHistory: CreationHistoryItem[] = (metadata || []).map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            tool: item.tool,
            timestamp: new Date(item.timestamp).getTime(),
            result: null, // Set result to null initially
          }));
          
          setHistory(initialHistory); // Set the initial state so the UI can render quickly

          // Step 2: Asynchronously fetch the full 'result' for each item individually.
          initialHistory.forEach(async (item) => {
            const controller = new AbortController();
            // Set a client-side timeout slightly less than the typical server timeout (8-10s).
            const timeoutId = setTimeout(() => controller.abort(), 7000);

            try {
              const { data: resultData, error: resultError } = await supabase
                .from('creations')
                .select('result')
                .eq('id', item.id)
                .abortSignal(controller.signal)
                .single();
              
              clearTimeout(timeoutId); // Clear the timeout if the request completes in time

              if (resultError) {
                  // Gracefully handle client-side timeouts without throwing an error.
                  if (resultError.name === 'AbortError' || resultError.message.includes('aborted')) {
                      console.warn(`Client-side timeout: Fetching details for creation ID ${item.id} took too long.`);
                  } else {
                     throw resultError; // Re-throw other, unexpected errors.
                  }
              } else if (resultData && resultData.result) {
                // Update the specific item in the history state with its full result
                setHistory(prevHistory =>
                  prevHistory.map(historyItem =>
                    historyItem.id === item.id
                      ? { ...historyItem, result: resultData.result }
                      : historyItem
                  )
                );
              }
            } catch (error) {
              clearTimeout(timeoutId);
              console.warn(`Failed to fetch full data for creation ID ${item.id}:`, error.message);
              // Item will remain in the list with a null result, which is handled by the UI.
            }
          });
        } catch (error) {
          console.error("Error fetching creation history metadata:", error.message);
          setHistory([]); // Clear history on error
        }
      } else {
        setHistory([]); // Clear history if no user
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
