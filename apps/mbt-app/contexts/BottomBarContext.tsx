"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

export interface BottomBarAction {
  key: string;
  label: string;
  Icon: any;
  variant?: "primary" | "secondary" | "danger";
  onClick?: () => void;
  disabled?: boolean;
}

interface BottomBarContextType {
  actions: BottomBarAction[];
  setActions: (actions: BottomBarAction[]) => void;
  addAction: (action: BottomBarAction) => void;
  removeAction: (key: string) => void;
  updateAction: (key: string, updates: Partial<BottomBarAction>) => void;
  clearActions: () => void;
}

const BottomBarContext = createContext<BottomBarContextType | undefined>(undefined);

interface BottomBarProviderProps {
  children: ReactNode;
}

export const BottomBarProvider = ({ children }: BottomBarProviderProps) => {
  const [actions, setActionsState] = useState<BottomBarAction[]>([]);

  const setActions = (newActions: BottomBarAction[]) => {
    setActionsState(newActions);
  };

  const addAction = (action: BottomBarAction) => {
    setActionsState(prev => {
      const filtered = prev.filter(a => a.key !== action.key);
      return [...filtered, action];
    });
  };

  const removeAction = (key: string) => {
    setActionsState(prev => prev.filter(a => a.key !== key));
  };

  const updateAction = (key: string, updates: Partial<BottomBarAction>) => {
    setActionsState(prev => prev.map(action => 
      action.key === key ? { ...action, ...updates } : action
    ));
  };

  const clearActions = () => {
    setActionsState([]);
  };

  const contextValue: BottomBarContextType = {
    actions,
    setActions,
    addAction,
    removeAction,
    updateAction,
    clearActions,
  };

  return (
    <BottomBarContext.Provider value={contextValue}>
      {children}
    </BottomBarContext.Provider>
  );
};

export const useBottomBar = () => {
  const context = useContext(BottomBarContext);
  if (context === undefined) {
    throw new Error('useBottomBar must be used within a BottomBarProvider');
  }
  return context;
};