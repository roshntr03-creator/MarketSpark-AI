/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useMarketingTools } from '../contexts/MarketingToolsProvider';
import { useTranslations } from '../contexts/LanguageProvider';
import ToolHeader from './ToolHeader';

const AssetKitResultsScreen: React.FC = () => {
    const { assetKitResult, setAssetKitResult } = useMarketingTools();
    const { t } = useTranslations();

    if (!assetKitResult) return null;

    const { result } = assetKitResult;
    const { logoStyles, colorPalette, fontPairings, imageStyles } = result;

    const handleStartNew = () => setAssetKitResult(null);

    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-8">
            <ToolHeader title={t.assetKitResultsTitle} onBack={handleStartNew} />
            <div className="px-4 sm:px-0 space-y-6">
                {/* Color Palette */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-300 mb-4">{t.colorPalette}</h2>
                    <div className="flex flex-wrap gap-4">
                        {colorPalette.map(color => (
                            <div key={color.hex} className="text-center">
                                <div className="w-16 h-16 rounded-full shadow-md" style={{ backgroundColor: color.hex }}></div>
                                <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{color.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{color.hex}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Font Pairings */}
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-300 mb-4">{t.fontPairings}</h2>
                        <div className="space-y-4">
                            {fontPairings.map((font, i) => (
                                <div key={i}>
                                    <p className="text-3xl" style={{ fontFamily: font.headline }}>Headline: {font.headline}</p>
                                    <p className="text-md" style={{ fontFamily: font.body }}>Body: {font.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Image Style Guide */}
                    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-300 mb-4">{t.imageStyleGuide}</h2>
                        <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                            {imageStyles.map((style, i) => <li key={i}>{style}</li>)}
                        </ul>
                    </div>
                </div>

                {/* Logo Suggestions */}
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/80 dark:border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-300 mb-4">{t.logoSuggestions}</h2>
                    <div className="space-y-4">
                        {logoStyles.map((logo, i) => (
                            <div key={i} className="border-b border-gray-200 dark:border-gray-700/50 pb-4 last:border-b-0">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{logo.style}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{logo.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssetKitResultsScreen;
