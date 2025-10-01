/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useTranslations } from '../contexts/LanguageProvider';
import { MicrophoneIcon } from './icons';

interface VoiceCoachFABProps {
    onClick: () => void;
}

const VoiceCoachFAB: React.FC<VoiceCoachFABProps> = ({ onClick }) => {
    const { t } = useTranslations();

    return (
        <button
            onClick={onClick}
            className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40 flex items-center gap-3 pl-4 pr-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all transform-gpu"
            aria-label={t.voiceCoachFAB}
        >
            <MicrophoneIcon className="w-6 h-6" />
            <span className="text-sm hidden md:inline">{t.voiceCoachFAB}</span>
        </button>
    );
};

export default VoiceCoachFAB;
