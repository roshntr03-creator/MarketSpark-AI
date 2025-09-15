/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface BrandContextType {
  brandPersona: string;
  setBrandPersona: (persona: string) => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

const BRAND_PERSONA_STORAGE_KEY = 'brandPersona';

export const BrandProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [brandPersona, setBrandPersona] = useState<string>(() => {
    return localStorage.getItem(BRAND_PERSONA_STORAGE_KEY) || '';
  });

  useEffect(() => {
    localStorage.setItem(BRAND_PERSONA_STORAGE_KEY, brandPersona);
  }, [brandPersona]);
  
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