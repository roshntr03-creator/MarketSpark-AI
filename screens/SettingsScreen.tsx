/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeProvider';
import { useTranslations } from '../contexts/LanguageProvider';
import { useAuth } from '../contexts/AuthProvider';

const SettingsScreen: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useTranslations();
  const { logout } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(() => 
    theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateMode = () => {
      const currentlyDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
      setIsDarkMode(currentlyDark);
    };

    updateMode(); // Initial check

    mediaQuery.addEventListener('change', updateMode);

    return () => mediaQuery.removeEventListener('change', updateMode);
  }, [theme]);


  const handleThemeToggle = () => {
      setTheme(isDarkMode ? 'light' : 'dark');
  };

  const activeLangClasses = 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-md';
  const inactiveLangClasses = 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800';

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-8 p-4 sm:p-6 md:p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t.settingsTitle}</h1>
        <p className="text-md text-gray-600 dark:text-gray-400 mt-1">{t.settingsSubtitle}</p>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6 space-y-6">
        {/* Language Setting */}
        <div>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">{t.language}</h3>
                <div className="flex bg-gray-200 dark:bg-gray-900 rounded-lg p-1">
                    <button
                        onClick={() => setLang('ar')}
                        className={`py-2 px-6 rounded-md transition-colors text-sm font-semibold ${lang === 'ar' ? activeLangClasses : inactiveLangClasses}`}
                    >
                        العربية
                    </button>
                    <button
                        onClick={() => setLang('en')}
                        className={`py-2 px-6 rounded-md transition-colors text-sm font-semibold ${lang === 'en' ? activeLangClasses : inactiveLangClasses}`}
                    >
                        English
                    </button>
                </div>
            </div>
        </div>

        {/* Theme Setting */}
        <div>
          <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">{t.theme}</h3>
              <button
                type="button"
                role="switch"
                aria-checked={isDarkMode}
                onClick={handleThemeToggle}
                className={`${isDarkMode ? 'bg-indigo-600' : 'bg-gray-400 dark:bg-gray-600'}
                  relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900`}
              >
                <span className="sr-only">Use setting</span>
                <span
                  className={`${isDarkMode ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-0 rtl:translate-x-0'}
                    pointer-events-none relative inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out -translate-y-px`}
                >
                  <span
                    className={`${isDarkMode ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'}
                      absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                    aria-hidden="true"
                  >
                    <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM3.25 10a.75.75 0 01-.75-.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM17.5 10a.75.75 0 01-.75-.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM6.168 14.832a.75.75 0 01-1.06-1.06l-1.06-1.061a.75.75 0 111.06-1.06l1.06 1.06a.75.75 0 010 1.061zM14.832 6.168a.75.75 0 01-1.06-1.06l-1.06-1.06a.75.75 0 011.06-1.06l1.06 1.06a.75.75 0 010 1.06zM13.832 13.832a.75.75 0 011.06 1.06l1.06 1.06a.75.75 0 11-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM5.108 5.108a.75.75 0 011.06 1.06l1.06 1.06a.75.75 0 11-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06z"></path>
                    </svg>
                  </span>
                  <span
                    className={`${isDarkMode ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'}
                      absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                    aria-hidden="true"
                  >
                    <svg className="h-4 w-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                    </svg>
                  </span>
                </span>
              </button>
          </div>
        </div>
      </div>
      
      {/* Account Card */}
      <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
         <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">{t.account}</h3>
         <button
            onClick={logout}
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold py-3 px-4 rounded-lg transition-colors text-center"
         >
           {t.logout}
         </button>
      </div>
    </div>
  );
};

export default SettingsScreen;