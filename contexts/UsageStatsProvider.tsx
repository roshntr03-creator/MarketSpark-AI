/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useMemo } from 'react';
import type { Tool, UsageLogEntry, RecentActivity } from '../types/index';

type RawStats = { [key in Tool]?: number };

interface UsageStatsContextType {
  rawStats: RawStats;
  recentActivity: RecentActivity[];
  incrementToolUsage: (tool: Tool, count?: number) => void;
}

const UsageStatsContext = createContext<UsageStatsContextType | undefined>(undefined);

const USAGE_LOG_STORAGE_KEY = 'usageLog';

export const UsageStatsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [log, setLog] = useState<UsageLogEntry[]>(() => {
      try {
          const storedLog = localStorage.getItem(USAGE_LOG_STORAGE_KEY);
          return storedLog ? JSON.parse(storedLog) : [];
      } catch (error) {
          console.error("Failed to parse usage log from localStorage", error);
          return [];
      }
  });

  useEffect(() => {
      try {
          localStorage.setItem(USAGE_LOG_STORAGE_KEY, JSON.stringify(log));
      } catch (error) {
          console.error("Failed to save usage log to localStorage", error);
      }
  }, [log]);

  const incrementToolUsage = useCallback((tool: Tool, count = 1) => {
    const newEntries: UsageLogEntry[] = Array.from({ length: count }, () => ({
        tool,
        timestamp: Date.now(),
    }));
    setLog(prevLog => [...prevLog, ...newEntries]);
  }, []);

  const rawStats = useMemo<RawStats>(() => {
    return log.reduce((acc, entry) => {
        acc[entry.tool] = (acc[entry.tool] || 0) + 1;
        return acc;
    }, {} as RawStats);
  }, [log]);

  const recentActivity = useMemo<RecentActivity[]>(() => {
      const activityMap = new Map<string, number>();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const days: Date[] = [];
      for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dayString = date.toISOString().split('T')[0];
          activityMap.set(dayString, 0);
          days.push(date);
      }
      
      const sevenDaysAgo = today.getTime() - 6 * 24 * 60 * 60 * 1000;

      log.forEach(entry => {
          if (entry.timestamp >= sevenDaysAgo) {
            const entryDate = new Date(entry.timestamp);
            const entryDayString = entryDate.toISOString().split('T')[0];
            if (activityMap.has(entryDayString)) {
                activityMap.set(entryDayString, (activityMap.get(entryDayString) || 0) + 1);
            }
          }
      });

      return days.map(d => ({
          date: d,
          value: activityMap.get(d.toISOString().split('T')[0]) || 0,
      }));
  }, [log]);
  

  const value = { 
    rawStats,
    recentActivity,
    incrementToolUsage,
  };

  return (
    <UsageStatsContext.Provider value={value}>
      {children}
    </UsageStatsContext.Provider>
  );
};

export const useUsageStats = () => {
  const context = useContext(UsageStatsContext);
  if (context === undefined) {
    throw new Error('useUsageStats must be used within a UsageStatsProvider');
  }
  return context;
};