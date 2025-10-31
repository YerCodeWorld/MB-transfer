"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

export interface NavigationItem {
  id: string;
  label: string;
  data?: any;
  component?: React.ComponentType<any>;
}

export interface NavigationState {
  stack: NavigationItem[];
  currentSection: string;
}

interface NavigationContextType {
  navigation: NavigationState;
  pushView: (item: NavigationItem) => void;
  popView: () => void;
  resetToSection: (section: string) => void;
  navigateToIndex: (index: number) => void;
  setCurrentSection: (section: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [navigation, setNavigation] = useState<NavigationState>({
    stack: [],
    currentSection: 'itinerary'
  });

  const pushView = (item: NavigationItem) => {
    setNavigation(prev => ({
      ...prev,
      stack: [...prev.stack, item]
    }));
  };

  const popView = () => {
    setNavigation(prev => ({
      ...prev,
      stack: prev.stack.slice(0, -1)
    }));
  };

  const resetToSection = (section: string) => {
    setNavigation(prev => ({
      ...prev,
      stack: [],
      currentSection: section
    }));
  };

  const navigateToIndex = (index: number) => {
    setNavigation(prev => ({
      ...prev,
      stack: prev.stack.slice(0, index + 1)
    }));
  };

  const setCurrentSection = (section: string) => {
    setNavigation(prev => ({
      ...prev,
      currentSection: section,
      stack: []
    }));
  };

  return (
    <NavigationContext.Provider value={{
      navigation,
      pushView,
      popView,
      resetToSection,
      navigateToIndex,
      setCurrentSection
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}