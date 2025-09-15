/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
// FIX: Corrected the import path for the Screen type. It is defined in types/index.ts, not App.tsx.
import type { Screen } from '../types/index';
import { useTranslations } from '../contexts/LanguageProvider';
import { HomeIcon, ToolsIcon, ChartBarIcon, CogIcon, CalendarDaysIcon } from './icons';

interface BottomNavBarProps {
    activeScreen: Screen;
    setActiveScreen: (screen: Screen) => void;
}

const NavItem: React.FC<{
    screen: Screen,
    label: string,
    Icon: React.ElementType,
    isActive: boolean,
    onClick: () => void
}> = ({ screen, label, Icon, isActive, onClick }) => {
    const activeClasses = 'text-indigo-600 dark:text-indigo-400';
    const inactiveClasses = 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5';
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-1 w-full py-2 rounded-lg transition-all duration-200 ${isActive ? activeClasses : inactiveClasses}`}
            aria-current={isActive ? 'page' : undefined}
        >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium">{label}</span>
        </button>
    )
};


const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeScreen, setActiveScreen }) => {
    const { t } = useTranslations();

    const navItems: { screen: Screen; label: string; Icon: React.ElementType; }[] = [
        { screen: 'dashboard', label: t.navDashboard, Icon: HomeIcon },
        { screen: 'tools', label: t.navTools, Icon: ToolsIcon },
        { screen: 'planner', label: t.navPlanner, Icon: CalendarDaysIcon },
        { screen: 'analytics', label: t.navAnalytics, Icon: ChartBarIcon },
        { screen: 'settings', label: t.navSettings, Icon: CogIcon },
    ];

    return (
        <nav className="w-full border-t border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-gray-900/40 backdrop-blur-lg">
            <div className="flex justify-around items-center max-w-xl mx-auto h-20 px-2">
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
            </div>
        </nav>
    );
};

export default BottomNavBar;
