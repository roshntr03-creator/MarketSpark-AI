/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import Header from './components/Header';
import BottomNavBar from './components/BottomNavBar';
import SideNavBar from './components/SideNavBar';
import DashboardScreen from './screens/DashboardScreen';
import ToolsScreen from './screens/ToolsScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import SettingsScreen from './screens/SettingsScreen';
import PlannerScreen from './screens/PlannerScreen';
import OnboardingFlow from './components/OnboardingFlow';
import LoginScreen from './screens/LoginScreen';
import { useAuth } from './contexts/AuthProvider';
import { isApiConfigured } from './services/geminiService';
import { SparklesIcon } from './components/icons';
// FIX: Corrected the import path for the Screen type.
import type { Screen } from './types/index';

const ConfigurationErrorScreen: React.FC = () => {
  const debugInfo = {
    typeofProcess: typeof process,
    processEnvDefined: 'unknown',
    apiKeyExists: 'unknown',
    allEnvKeys: 'N/A',
  };

  try {
    debugInfo.processEnvDefined = String(typeof process.env !== 'undefined');
    if (typeof process.env !== 'undefined') {
      debugInfo.apiKeyExists = String(!!process.env.API_KEY);
      debugInfo.allEnvKeys = Object.keys(process.env).join(', ') || 'None';
    }
  } catch (e) {
    // process might not be defined, which is a useful data point.
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-transparent text-gray-900 dark:text-gray-100 font-sans justify-center items-center p-4 text-center">
      <div className="w-full max-w-lg mx-auto bg-red-500/10 border border-red-500/20 p-8 rounded-lg">
        <SparklesIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-red-300">Configuration Error</h1>
        <p className="text-md text-red-400 mt-2">
          The application is not configured correctly. The Gemini API key is missing.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Please ensure the <code>API_KEY</code> environment variable is set in your deployment environment. The application cannot function without it.
        </p>
        <div className="text-xs text-left text-gray-600 dark:text-gray-400 mt-6 bg-gray-100 dark:bg-gray-800/50 p-4 rounded-md border border-gray-300 dark:border-gray-600">
          <h3 className="font-bold mb-2">Debugging Information:</h3>
          <p>
            - <code>typeof process</code>: <strong>{debugInfo.typeofProcess}</strong>
          </p>
          <p>
            - <code>process.env</code> is defined: <strong>{debugInfo.processEnvDefined}</strong>
          </p>
          <p>
            - <code>process.env.API_KEY</code> has value: <strong>{debugInfo.apiKeyExists}</strong>
          </p>
          <p className="break-all">
            - Available <code>process.env</code> keys: <strong>{debugInfo.allEnvKeys}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const { isAuthenticated } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(() => {
    return localStorage.getItem('onboardingComplete') === 'true';
  });

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setOnboardingComplete(true);
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen setActiveScreen={setActiveScreen} />;
      case 'tools':
        return <ToolsScreen setActiveScreen={setActiveScreen} />;
      case 'analytics':
        return <AnalyticsScreen setActiveScreen={setActiveScreen} />;
      case 'planner':
        // FIX: Pass the setActiveScreen prop to PlannerScreen to match its required props.
        return <PlannerScreen setActiveScreen={setActiveScreen} />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen setActiveScreen={setActiveScreen} />;
    }
  };
  
  if (!isApiConfigured()) {
    return <ConfigurationErrorScreen />;
  }

  if (!onboardingComplete) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-transparent text-gray-900 dark:text-gray-100 font-sans">
      <SideNavBar activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
      <div className="flex flex-col flex-grow w-full md:w-0">
        <Header />
        <main className="flex-grow overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full h-full">
              {renderScreen()}
          </div>
        </main>
        <div className="md:hidden">
          <BottomNavBar activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
        </div>
      </div>
    </div>
  );
};

export default App;