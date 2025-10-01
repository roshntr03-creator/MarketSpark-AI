/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import type { Tool, CreationHistoryItem, CreationResult, GeneratedVideo, GeneratedImage, EditedImage, WorkflowResult, NewProductLaunchWorkflowResult, BlogPostRepurposingWorkflowResult } from '../types/index';
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
          // FIX: Log a specific error message instead of the generic [object Object].
          console.error("Error fetching creation history:", error instanceof Error ? error.message : String(error));
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
        throw new Error("Cannot add creation: no user is signed in.");
    }
    
    // This is the object that will be returned for immediate use in the UI, with the full result.
    const newCreation: CreationHistoryItem = {
      id: `${Date.now()}`, // Temporary ID
      user_id: user.id,
      tool,
      timestamp: Date.now(),
      result,
    };
    
    // Create a deep copy for storage to avoid modifying the object returned to the UI.
    const creationToStore: CreationHistoryItem = JSON.parse(JSON.stringify(newCreation));
    
    const timestampString = new Date(creationToStore.timestamp).toLocaleString();

    if (tool === 'video-generator') {
        (creationToStore.result as GeneratedVideo).videoUri = `Video generated on ${timestampString}`;
    } else if (tool === 'image-generator') {
        (creationToStore.result as GeneratedImage).image = `Image generated on ${timestampString}`;
    } else if (tool === 'image-editor') {
        const editedImageResult = creationToStore.result as EditedImage;
        editedImageResult.original = `Original image from ${timestampString}`;
        editedImageResult.edited = `Edited image from ${timestampString}`;
    } else if (tool === 'workflow') {
        // FIX: Add a type guard to handle different workflow result structures correctly,
        // preventing a crash when saving BlogPostRepurposingWorkflowResult.
        const workflowResult = creationToStore.result as WorkflowResult;
        if ('images' in workflowResult && Array.isArray(workflowResult.images)) {
             (workflowResult as NewProductLaunchWorkflowResult).images.forEach((img) => {
                img.image = `Image for post generated on ${timestampString}`;
            });
        } else if ('carouselImages' in workflowResult && Array.isArray(workflowResult.carouselImages)) {
             (workflowResult as BlogPostRepurposingWorkflowResult).carouselImages.forEach((img) => {
                img.image = `Image for post generated on ${timestampString}`;
            });
        }
    }
    
    // Optimistically update the local UI history with the modified (storage-safe) version.
    setHistory(prevHistory => [creationToStore, ...prevHistory].slice(0, MAX_HISTORY_ITEMS));

    // Asynchronously insert the storage-safe version into the database.
    const insertToDB = async () => {
        try {
            const { error } = await supabase.from('creations').insert({
                user_id: creationToStore.user_id,
                tool: creationToStore.tool,
                timestamp: new Date(creationToStore.timestamp).toISOString(),
                result: creationToStore.result,
            });
            if (error) throw error;
        } catch(error) {
            console.error("Failed to save creation to database:", error);
            // Optional: implement logic to revert the optimistic update
        }
    };
    insertToDB();

    // Return the original, unmodified creation item for immediate use in the results screen.
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