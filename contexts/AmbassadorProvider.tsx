/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import type { VirtualAmbassador } from '../types/index';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthProvider';

interface AmbassadorContextType {
  ambassadors: VirtualAmbassador[];
  addAmbassador: (ambassador: Omit<VirtualAmbassador, 'id' | 'user_id'>) => Promise<VirtualAmbassador>;
  loading: boolean;
}

const AmbassadorContext = createContext<AmbassadorContextType | undefined>(undefined);

export const AmbassadorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ambassadors, setAmbassadors] = useState<VirtualAmbassador[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAmbassadors = async () => {
      if (user) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('ambassadors')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setAmbassadors(data as VirtualAmbassador[]);
        } catch (error) {
          console.error("Error fetching ambassadors:", error);
          setAmbassadors([]);
        } finally {
            setLoading(false);
        }
      } else {
        setAmbassadors([]);
        setLoading(false);
      }
    };
    fetchAmbassadors();
  }, [user]);

  const addAmbassador = useCallback(async (ambassador: Omit<VirtualAmbassador, 'id' | 'user_id'>): Promise<VirtualAmbassador> => {
    if (!user) {
        throw new Error("Cannot add ambassador: no user is signed in.");
    }
    
    const { data, error } = await supabase
        .from('ambassadors')
        .insert({ ...ambassador, user_id: user.id })
        .select()
        .single();
    
    if (error) {
        console.error("Failed to save ambassador to database:", error);
        throw error;
    }

    const newAmbassador = data as VirtualAmbassador;
    setAmbassadors(prev => [newAmbassador, ...prev]);
    return newAmbassador;

  }, [user]);

  const value = { ambassadors, addAmbassador, loading };

  return (
    <AmbassadorContext.Provider value={value}>
      {children}
    </AmbassadorContext.Provider>
  );
};

export const useAmbassadors = () => {
  const context = useContext(AmbassadorContext);
  if (context === undefined) {
    throw new Error('useAmbassadors must be used within a AmbassadorProvider');
  }
  return context;
};