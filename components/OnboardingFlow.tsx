/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { useTranslations } from '../contexts/LanguageProvider';
import { SparklesIcon, WrenchScrewdriverIcon, ChartBarIcon } from './icons';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const { t } = useTranslations();

  const onboardingSteps = [
    {
      Icon: SparklesIcon,
      title: t.onboardingWelcomeTitle,
      description: t.onboardingWelcomeDesc,
    },
    {
      Icon: WrenchScrewdriverIcon,
      title: t.onboardingToolsTitle,
      description: t.onboardingToolsDesc,
    },
    {
      Icon: ChartBarIcon,
      title: t.onboardingAnalyticsTitle,
      description: t.onboardingAnalyticsDesc,
    },
  ];
  
  const isLastStep = step === onboardingSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(s => s - 1);
    }
  };

  const currentStep = onboardingSteps[step];

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-transparent text-gray-900 dark:text-gray-100 font-sans justify-center items-center p-4">
        <div className="w-full max-w-sm mx-auto text-center flex flex-col justify-between h-full max-h-[500px]">
            <div className="flex-grow flex flex-col items-center justify-center">
                <div className="p-4 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full mb-6">
                    <currentStep.Icon className="w-12 h-12 text-indigo-500 dark:text-indigo-300" />
                </div>
                <h1 className="text-2xl font-bold mb-2">{currentStep.title}</h1>
                <p className="text-gray-600 dark:text-gray-400">{currentStep.description}</p>
            </div>
            
            <div>
                {/* Progress Dots */}
                <div className="flex justify-center gap-2 my-6">
                    {onboardingSteps.map((_, index) => (
                        <div key={index} className={`w-2 h-2 rounded-full transition-colors ${step === index ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    ))}
                </div>

                {/* Navigation */}
                <div className="space-y-3">
                    <button onClick={handleNext} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5">
                        {isLastStep ? t.getStarted : t.next}
                    </button>
                    {step > 0 && (
                         <button onClick={handleBack} className="w-full bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-3 px-4 rounded-lg transition-colors">
                           {t.back}
                        </button>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default OnboardingFlow;