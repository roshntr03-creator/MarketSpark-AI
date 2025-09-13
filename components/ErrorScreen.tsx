/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useTranslations } from '../contexts/LanguageProvider';

interface ErrorScreenProps {
    error: string;
    onRetry: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onRetry }) => {
    const { t } = useTranslations();
    return (
        <div className="text-center animate-fade-in bg-red-500/10 border border-red-500/20 p-8 rounded-lg max-w-2xl mx-auto flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold text-red-300">{t.errorTitle}</h2>
            <p className="text-md text-red-400">{error}</p>
            <button
                onClick={onRetry}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg text-md transition-colors"
            >
                {t.tryAgainButton}
            </button>
        </div>
    );
};

export default ErrorScreen;
