/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthProvider';

interface BrandContextType {
  brandPersona: string;
  setBrandPersona: (persona: string) => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [brandPersona, setBrandPersona] = useState<string>('');
  const [isInitialFetchComplete, setIsInitialFetchComplete] = useState(false);
  const { user } = useAuth();

  // Fetch brand persona from DB when user logs in, or create one if it doesn't exist.
  useEffect(() => {
    const fetchPersona = async () => {
      if (user) {
        setIsInitialFetchComplete(false); // Reset for new user login
        try {
          // Fetch the user's profile
          const { data, error } = await supabase
            .from('profiles')
            .select('brand_persona')
            .eq('id', user.id)
            .limit(1);

          // If there's an error and it's not the "no rows found" error, throw it.
          if (error && error.code !== 'PGRST116') {
            throw new Error(`Supabase query failed: ${error.message}`);
          }

          // If a profile exists, set the brand persona from it.
          if (data && data.length > 0) {
            setBrandPersona(data[0].brand_persona || '');
          } else {
            // If no profile exists (e.g., for a brand new user or if the trigger failed),
            // create one now to prevent future errors.
            console.log("No profile found for user, creating one.");
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({ id: user.id, brand_persona: '' });

            if (insertError) {
              // If creating the profile fails, log the error.
              throw new Error(`Failed to create user profile: ${insertError.message}`);
            }
            // Set the local state to the default empty string.
            setBrandPersona('');
          }
        } catch (error) {
          console.error('Error fetching or creating brand persona:', error);
        } finally {
            setIsInitialFetchComplete(true);
        }
      }
    };
    fetchPersona();
  }, [user]);
  
  // Debounced update to DB
  useEffect(() => {
    const handler = setTimeout(async () => {
        // Only update if the initial fetch is done and the user is logged in
        if (isInitialFetchComplete && user) {
            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({ brand_persona: brandPersona })
                    .eq('id', user.id);
                if (error) throw error;
            } catch (error) {
                console.error('Error updating brand persona:', error);
            }
        }
    }, 1000); // 1-second debounce

    return () => {
        clearTimeout(handler);
    };
  }, [brandPersona, user, isInitialFetchComplete]);


  const value = { brandPersona, setBrandPersona };

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};