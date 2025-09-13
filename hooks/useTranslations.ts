/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Note: The primary useTranslations hook is co-located with its provider
// in contexts/LanguageProvider.tsx for simplicity. This file is a placeholder.

const useTranslationsHook = () => {
    console.warn("This hook is a placeholder. Please import useTranslations from 'contexts/LanguageProvider'.");
    return {
        lang: 'en',
        setLang: (lang: 'en' | 'ar') => {},
        t: {},
    };
};

export default useTranslationsHook;
