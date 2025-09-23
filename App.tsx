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
import type { Screen } from './types/index';

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const { session } = useAuth();
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
        return <PlannerScreen setActiveScreen={setActiveScreen} />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen setActiveScreen={setActiveScreen} />;
    }
  };
  
  if (!onboardingComplete) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }
  
  if (!session) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-transparent text-gray-900 dark:text-gray-100 font-sans">
      <SideNavBar activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
      <div className="flex flex-col flex-grow w-full md:w-0">
        <Header />
        <main className="flex-grow overflow-y-auto pb-20 md:pb-0">
          <div className="max-w-7xl mx-auto w-full h-full">
              {renderScreen()}
          </div>
        </main>
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
          <BottomNavBar activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
        </div>
      </div>
    </div>
  );
};

export default App;