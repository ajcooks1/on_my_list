

import React from 'react';
import { AppTab } from '../types';
import Deals from './Deals';
import ShoppingList from './ShoppingList';
import Health from './Health';
import News from './News';
import Subscription from './Subscription';
import Profile from './Profile';

interface DashboardProps {
  activeTab: AppTab;
  isSubscribed: boolean;
  activePlan: string | null;
  onSubscribe: (planName: string) => void;
  setActiveTab: (tab: AppTab) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ activeTab, isSubscribed, activePlan, onSubscribe, setActiveTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case AppTab.Deals:
        return <Deals />;
      case AppTab.ShoppingList:
        return <ShoppingList />;
      case AppTab.Health:
        return <Health isSubscribed={isSubscribed} setActiveTab={setActiveTab} />;
      case AppTab.News:
        return <News />;
      case AppTab.Subscription:
        return <Subscription isSubscribed={isSubscribed} activePlan={activePlan} onSubscribe={onSubscribe} />;
      case AppTab.Profile:
        return <Profile />;
      default:
        return <Deals />;
    }
  };

  return <div className="p-6">{renderContent()}</div>;
};

export default Dashboard;