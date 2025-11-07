import React from 'react';
import { TagIcon, ShoppingCartIcon, HeartIcon, NewspaperIcon, StarIcon, LogoutIcon, UserCircleIcon } from './common/icons';
import { AppTab } from '../types';
import { useLocalization } from '../context/localization';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    activeTab: AppTab;
    setActiveTab: (tab: AppTab) => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, activeTab, setActiveTab, onLogout }) => {
    const { t } = useLocalization();
    const navItems = [
        { name: t('deals'), icon: <TagIcon className="h-5 w-5 flex-shrink-0" />, tab: AppTab.Deals },
        { name: t('shoppingLists'), icon: <ShoppingCartIcon className="h-5 w-5 flex-shrink-0" />, tab: AppTab.ShoppingList },
        { name: t('health'), icon: <HeartIcon className="h-5 w-5 flex-shrink-0" />, tab: AppTab.Health },
        { name: t('news'), icon: <NewspaperIcon className="h-5 w-5 flex-shrink-0" />, tab: AppTab.News },
        { name: t('subscription'), icon: <StarIcon className="h-5 w-5 flex-shrink-0" />, tab: AppTab.Subscription },
        { name: t('profile'), icon: <UserCircleIcon className="h-5 w-5 flex-shrink-0" />, tab: AppTab.Profile },
    ];

    const handleNavigation = (tab: AppTab) => {
        setActiveTab(tab);
        // On smaller screens, close the sidebar after clicking an item.
        if (window.innerWidth < 1024) {
            setIsOpen(false);
        }
    };

    return (
         <aside className={`
            fixed inset-y-0 left-0 z-30 flex-shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md flex flex-col shadow-lg 
            transition-all duration-300 ease-in-out
            lg:relative lg:translate-x-0
            ${isOpen ? 'w-64 p-4' : 'w-0 p-0 lg:w-20 lg:p-4'}
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
            <div className={`h-full flex flex-col overflow-hidden ${!isOpen && 'hidden lg:flex'}`}>
                <nav className="flex-grow">
                    <ul className="space-y-2">
                        {navItems.map(item => (
                            <li key={item.name}>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavigation(item.tab);
                                    }}
                                    className={`flex items-center py-3 rounded-lg transition-colors duration-200
                                        ${isOpen ? 'px-3 space-x-4' : 'lg:justify-center'}
                                        ${activeTab === item.tab
                                            ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-bold'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
                                    }`}
                                    title={item.name}
                                >
                                    {item.icon}
                                    <span className={`whitespace-nowrap ${isOpen ? 'inline' : 'hidden'}`}>{item.name}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="mt-auto border-t border-gray-200/50 dark:border-gray-700/50 pt-2 mt-2">
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            onLogout();
                        }}
                        className={`flex items-center py-3 rounded-lg text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/50
                            ${isOpen ? 'px-3 space-x-4' : 'lg:justify-center'}
                        `}
                    >
                        <LogoutIcon className="h-5 w-5 flex-shrink-0" />
                        <span className={`whitespace-nowrap ${isOpen ? 'inline' : 'hidden'}`}>Log out</span>
                    </a>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;