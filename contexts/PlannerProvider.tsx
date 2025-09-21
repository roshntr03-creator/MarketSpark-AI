/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import type { PlannerItem } from '../types/index';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthProvider';

interface PlannerContextType {
  plannerItems: PlannerItem[];
  addPlannerItem: (item: Omit<PlannerItem, 'id' | 'user_id'>) => void;
  // Future functions: removePlannerItem, updatePlannerItem
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export const PlannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPlannerItems = async () => {
        if (user) {
            try {
                const { data, error } = await supabase
                    .from('planner_items')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('scheduledDateTime', { ascending: true });
                
                if (error) throw error;
                setPlannerItems(data as PlannerItem[]);
            } catch (error) {
                console.error("Error fetching planner items:", error);
                setPlannerItems([]);
            }
        } else {
            // Clear items when user logs out
            setPlannerItems([]);
        }
    };
    fetchPlannerItems();
  }, [user]);

  const addPlannerItem = useCallback((item: Omit<PlannerItem, 'id' | 'user_id'>) => {
    if (!user) {
        throw new Error("Cannot add planner item: no user is signed in.");
    }
    
    // Asynchronously insert into the database
    const insertToDB = async () => {
        try {
            const newItemPayload = {
                ...item,
                user_id: user.id
            };
            const { data, error } = await supabase
                .from('planner_items')
                .insert(newItemPayload)
                .select()
                .single();

            if (error) throw error;

            // Add to local state for immediate UI update
            setPlannerItems(prevItems => [...prevItems, data as PlannerItem].sort((a, b) => new Date(a.scheduledDateTime).getTime() - new Date(b.scheduledDateTime).getTime()));

        } catch(error) {
            console.error("Failed to save planner item to database:", error);
        }
    };
    insertToDB();

  }, [user]);

  const value = { plannerItems, addPlannerItem };

  return (
    <PlannerContext.Provider value={value}>
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (context === undefined) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
};