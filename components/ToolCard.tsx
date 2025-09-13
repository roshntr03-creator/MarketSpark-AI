/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface ToolCardProps {
    title: string;
    description: string;
    Icon: React.ElementType;
    onClick?: () => void;
    disabled?: boolean;
}

const ToolCard: React.FC<ToolCardProps> = ({ title, description, Icon, onClick, disabled }) => {
    const baseClasses = "group relative w-full p-6 bg-white/60 dark:bg-gray-800/40 backdrop-blur-md border rounded-xl transition-all duration-300 ease-in-out text-left";
    const enabledClasses = "border-gray-200/80 dark:border-white/10 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 cursor-pointer";
    const disabledClasses = "border-gray-200/50 dark:border-gray-700/50 opacity-50 cursor-not-allowed";
    
    return (
        <div onClick={!disabled ? onClick : undefined} className={`${baseClasses} ${disabled ? disabledClasses : enabledClasses}`}>
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg group-hover:bg-indigo-500/10 dark:group-hover:bg-indigo-500/20 transition-colors">
                    <Icon className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </div>
            </div>
            {disabled && (
                <div className="absolute top-2 right-2 bg-yellow-500/20 text-yellow-500 dark:text-yellow-300 text-xs font-bold px-2 py-1 rounded-full">
                    Coming Soon
                </div>
            )}
        </div>
    );
};

export default ToolCard;