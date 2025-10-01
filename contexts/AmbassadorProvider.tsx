/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useContext, ReactNode } from 'react';

// This provider is no longer in active use and is kept to avoid file deletion.
// The Virtual Ambassador tool has been repurposed into the UGC Video Generator.

const AmbassadorContext = createContext<undefined>(undefined);

export const AmbassadorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AmbassadorContext.Provider value={undefined}>
      {children}
    </AmbassadorContext.Provider>
  );
};

export const useAmbassadors = () => {
  const context = useContext(AmbassadorContext);
  return context;
};