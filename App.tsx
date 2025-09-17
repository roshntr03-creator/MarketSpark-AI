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
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-transparent text-gray-900 dark:text-gray-100 font-sans justify-center items-center p-4 text-center">
      <div className="w-full max-w-lg mx-auto bg-red-500/10 border border-red-500/20 p-8 rounded-lg" dir="rtl">
        <SparklesIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-red-300">خطأ في الإعدادات</h1>
        <p className="text-md text-red-400 mt-2">
          التطبيق غير مهيأ بشكل صحيح. مفتاح Gemini API مفقود.
        </p>

        <div className="text-sm text-right text-gray-300 mt-6 bg-blue-900/30 border border-blue-500/40 p-4 rounded-md">
          <h3 className="font-bold mb-2 text-white">الحل:</h3>
          <p className="mb-2">
            يبدو أنك تشغل هذا التطبيق مباشرة في المتصفح. لتوفير مفتاح API الخاص بك بأمان، يرجى اتباع الخطوات التالية:
          </p>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              افتح أدوات المطور في متصفحك (اضغط <strong>F12</strong> أو <strong>Ctrl+Shift+I</strong>).
            </li>
            <li>
              انتقل إلى تبويب <strong>"Console"</strong>.
            </li>
            <li>
              انسخ الأمر التالي، استبدل <code>'YOUR_KEY_HERE'</code> بمفتاحك الفعلي، ثم اضغط على Enter.
            </li>
          </ol>
          <pre className="mt-3 bg-gray-900/80 p-3 rounded-md text-cyan-300 text-xs text-left break-all">
            <code>localStorage.setItem('GEMINI_API_KEY', 'YOUR_KEY_HERE')</code>
          </pre>
          <p className="mt-3">
            بعد تنفيذ الأمر، قم <strong>بتحديث الصفحة (F5)</strong>. سيتم حفظ المفتاح بأمان في متصفحك.
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