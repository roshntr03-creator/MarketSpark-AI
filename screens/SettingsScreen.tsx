/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useTranslations } from '../contexts/LanguageProvider';
import { useAuth } from '../contexts/AuthProvider';
import { useBrand } from '../contexts/BrandProvider';
import { GlobeAltIcon, UserCircleIcon, MegaphoneIcon } from '../components/icons';

const SettingsScreen: React.FC = () => {
  const { lang, setLang, t } = useTranslations();
  const { logout, user } = useAuth();
  const { brandPersona, setBrandPersona } = useBrand();
  
  const activeSegmentClasses = 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-md';
  const inactiveSegmentClasses = 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800';

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-8 p-4 sm:p-6 md:p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t.settingsTitle}</h1>
        <p className="text-md text-gray-600 dark:text-gray-400 mt-1">{t.settingsSubtitle}</p>
      </div>

      <div className="space-y-6">
        {/* Brand Persona Card */}
        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl">
            <div className="p-6">
                <h3 className="flex items-center gap-3 text-lg font-medium text-gray-900 dark:text-gray-100">
                    <MegaphoneIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                    {t.brandPersona}
                </h3>
                 <div className="mt-4 pt-4 border-t border-gray-200/80 dark:border-white/10">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t.brandPersonaDescription}</p>
                    <textarea
                        rows={4}
                        value={brandPersona}
                        onChange={(e) => setBrandPersona(e.target.value)}
                        placeholder={t.brandPersonaPlaceholder}
                        className="w-full bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition backdrop-blur-sm"
                    />
                 </div>
            </div>
        </div>
        
        {/* Language Card */}
         <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl">
            <div className="p-6">
                <h3 className="flex items-center gap-3 text-lg font-medium text-gray-900 dark:text-gray-100">
                    <GlobeAltIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                    {t.language}
                </h3>
                 <div className="mt-4 pt-4 border-t border-gray-200/80 dark:border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                         <div>
                            <p className="font-medium text-gray-700 dark:text-gray-300">{t.language}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t.languageDescription}</p>
                        </div>
                         <div className="flex-shrink-0 bg-gray-200 dark:bg-gray-900 rounded-lg p-1 flex">
                            <button onClick={() => setLang('ar')} className={`py-2 px-6 rounded-md transition-colors text-sm font-semibold ${lang === 'ar' ? activeSegmentClasses : inactiveSegmentClasses}`}>العربية</button>
                            <button onClick={() => setLang('en')} className={`py-2 px-6 rounded-md transition-colors text-sm font-semibold ${lang === 'en' ? activeSegmentClasses : inactiveSegmentClasses}`}>English</button>
                        </div>
                    </div>
                 </div>
            </div>
        </div>

        {/* Account Card */}
        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl">
            <div className="p-6">
                <h3 className="flex items-center gap-3 text-lg font-medium text-gray-900 dark:text-gray-100">
                    <UserCircleIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                    {t.account}
                </h3>
                <div className="mt-4 pt-4 border-t border-gray-200/80 dark:border-white/10 space-y-4">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.signedInAs}</p>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">{user?.email}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold py-3 px-4 rounded-lg transition-colors text-center"
                    >
                        {t.logout}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;