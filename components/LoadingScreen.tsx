/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useTranslations } from '../contexts/LanguageProvider';

const LoadingScreen: React.FC = () => {
    const { t } = useTranslations();
    return (
        <div className="text-center animate-fade-in flex flex-col items-center justify-center h-full">
            <div className="loader mb-8"></div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-300">{t.loadingTitle}</h2>
            <p className="text-md text-gray-600 dark:text-gray-400 max-w-md mt-2">{t.loadingSubtitle}</p>
        </div>
    );
};

export default LoadingScreen;