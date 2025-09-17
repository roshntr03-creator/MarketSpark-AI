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
          عذرًا، يبدو أن التطبيق غير مُعد بشكل صحيح. إذا كنت مستخدمًا عاديًا، يرجى التواصل مع مالك الموقع.
        </p>

        <div className="text-sm text-right text-gray-300 mt-6 bg-blue-900/30 border border-blue-500/40 p-4 rounded-md space-y-4">
          <h2 className="font-bold text-lg text-white">لمالك الموقع / المطور:</h2>
          <p>
            مفتاح Gemini API غير موجود. لتشغيل التطبيق، يجب إعداده بشكل صحيح.
          </p>
          <div>
            <h3 className="font-semibold text-cyan-400">للنشر (Production):</h3>
            <p className="text-sm">
              الطريقة الأكثر أمانًا والموصى بها هي تعيين <code className="bg-gray-700 p-1 rounded">API_KEY</code> كمتغير بيئة (environment variable) في بيئة الاستضافة الخاصة بك. سيكتشفه التطبيق ويستخدمه تلقائيًا.
            </p>
          </div>
           <div>
            <h3 className="font-semibold text-cyan-400">للتطوير المحلي (Local Development):</h3>
            <p className="text-sm">
              للاختبار على جهازك المحلي، يمكنك تعيين المفتاح مؤقتًا في متصفحك. افتح وحدة تحكم المطور (F12) وقم بتشغيل الأمر التالي:
            </p>
            <code className="block bg-gray-900 p-2 rounded mt-2 text-white text-xs text-left" dir="ltr">localStorage.setItem('GEMINI_API_KEY', 'PASTE_YOUR_API_KEY_HERE');</code>
            <p className="text-sm mt-1">بعد ذلك، قم بتحديث الصفحة.</p>
          </div>
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