/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
// FIX: Corrected the import path for the Screen type. It is defined in types/index.ts, not App.tsx.
import type { Screen } from '../types/index';
import { useTranslations } from '../contexts/LanguageProvider';
import { HomeIcon, WrenchScrewdriverIcon, ChartBarIcon, CogIcon, SparklesIcon, CalendarDaysIcon } from './icons';

interface SideNavBarProps {
    activeScreen: Screen;
    setActiveScreen: (screen: Screen) => void;
}

const NavItem: React.FC<{
    screen: Screen,
    label: string,
    Icon: React.ElementType,
    isActive: boolean,
    onClick: () => void
}> = ({ label, Icon, isActive, onClick }) => {
    const activeClasses = 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400';
    const inactiveClasses = 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white';
    
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-4 w-full px-4 py-3 rounded-lg transition-all duration-200 text-base font-semibold ${isActive ? activeClasses : inactiveClasses}`}
            aria-current={isActive ? 'page' : undefined}
        >
            <Icon className="w-6 h-6 flex-shrink-0" />
            <span>{label}</span>
        </button>
    )
};

const SideNavBar: React.FC<SideNavBarProps> = ({ activeScreen, setActiveScreen }) => {
    const { t } = useTranslations();

    const navItems: { screen: Screen; label: string; Icon: React.ElementType; }[] = [
        { screen: 'dashboard', label: t.navDashboard, Icon: HomeIcon },
        { screen: 'tools', label: t.navTools, Icon: WrenchScrewdriverIcon },
        { screen: 'planner', label: t.navPlanner, Icon: CalendarDaysIcon },
        { screen: 'analytics', label: t.navAnalytics, Icon: ChartBarIcon },
        { screen: 'settings', label: t.navSettings, Icon: CogIcon },
    ];

    return (
        <aside className="w-64 flex-shrink-0 p-4 border-r rtl:border-r-0 rtl:border-l border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-gray-900/40 backdrop-blur-lg hidden md:flex flex-col">
            <div className="flex items-center gap-3 px-2 pt-4 pb-6">
                <SparklesIcon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 truncate">
                  {t.headerTitle}
                </h1>
            </div>
            <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                    <NavItem
                        key={item.screen}
                        screen={item.screen}
                        label={item.label}
                        Icon={item.Icon}
                        isActive={activeScreen === item.screen}
                        onClick={() => setActiveScreen(item.screen)}
                    />
                ))}
            </nav>
        </aside>
    );
};

export default SideNavBar;