/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './contexts/ThemeProvider';
import { LanguageProvider } from './contexts/LanguageProvider';
import { MarketingToolsProvider } from './contexts/MarketingToolsProvider';
import { UsageStatsProvider } from './contexts/UsageStatsProvider';
import { AuthProvider } from './contexts/AuthProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <UsageStatsProvider>
          <MarketingToolsProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </MarketingToolsProvider>
        </UsageStatsProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);