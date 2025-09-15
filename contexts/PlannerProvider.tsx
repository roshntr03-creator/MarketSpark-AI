/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import type { PlannerItem } from '../types/index';

interface PlannerContextType {
  plannerItems: PlannerItem[];
  addPlannerItem: (item: Omit<PlannerItem, 'id'>) => void;
  // Future functions: removePlannerItem, updatePlannerItem
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

const PLANNER_STORAGE_KEY = 'contentPlanner';

export const PlannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>(() => {
    try {
      const storedItems = localStorage.getItem(PLANNER_STORAGE_KEY);
      return storedItems ? JSON.parse(storedItems) : [];
    } catch (error) {
      console.error("Failed to parse planner items from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(plannerItems));
    } catch (error) {
      console.error("Failed to save planner items to localStorage", error);
    }
  }, [plannerItems]);

  const addPlannerItem = useCallback((item: Omit<PlannerItem, 'id'>) => {
    const newItem: PlannerItem = {
      ...item,
      id: `${Date.now()}`,
    };
    setPlannerItems(prevItems => [...prevItems, newItem].sort((a, b) => new Date(a.scheduledDateTime).getTime() - new Date(b.scheduledDateTime).getTime()));
  }, []);

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