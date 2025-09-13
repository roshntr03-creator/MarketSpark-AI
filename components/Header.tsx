/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useTranslations } from '../contexts/LanguageProvider';
import { SparklesIcon } from './icons';

const Header: React.FC = () => {
  const { t } = useTranslations();
  return (
    <header className="md:hidden w-full py-4 px-8 border-b border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-gray-900/40 backdrop-blur-lg sticky top-0 z-50">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
              <SparklesIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {t.headerTitle}
              </h1>
          </div>
      </div>
    </header>
  );
};

export default Header;