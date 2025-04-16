import { useState } from 'react';

export type AdminTab = 'orders' | 'products' | 'analytics' | 'settings';

export const useAdminTabs = (defaultTab: AdminTab = 'orders') => {
  const [activeTab, setActiveTab] = useState<AdminTab>(defaultTab);

  // Returns true if the specified tab is active
  const isTabActive = (tab: AdminTab) => activeTab === tab;

  // Switches to the specified tab
  const switchTab = (tab: AdminTab) => {
    setActiveTab(tab);
  };

  return {
    activeTab,
    isTabActive,
    switchTab
  };
};
