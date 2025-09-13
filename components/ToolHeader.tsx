/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { ArrowLeftIcon } from './icons';
import { useTranslations } from '../contexts/LanguageProvider';

interface ToolHeaderProps {
  title: string;
  onBack: () => void;
}

const ToolHeader: React.FC<ToolHeaderProps> = ({ title, onBack }) => {
  const { lang, t } = useTranslations();
  return (
    <div className="flex items-center gap-4 mb-6 pt-4 px-4 sm:px-0 sm:pt-0">
      <button
        onClick={onBack}
        className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label={t.back}
      >
        <ArrowLeftIcon className={`w-6 h-6 text-gray-700 dark:text-gray-300 ${lang === 'ar' ? 'transform rotate-180' : ''}`} />
      </button>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
    </div>
  );
};

export default ToolHeader;