"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type userRole = 'ADMIN' | 'COORDINATOR' | 'DEVELOPPER' | 'DRIVER' | 'ALLY'; 

interface User {
  name: string;
  image: string;
  accessKey: string;
  role: userRole; 
}

interface AuthContextType {
  isAuthenticated: boolean;
  authenticate: (accessKey: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const users: User[] = [
  {
    name: "Maicol Fede Báez",
    image: "MAICOL.jpeg",
    accessKey: "|StA{+c#z<Vqv9",
    role: "ADMIN"
  },
  {
    name: "Yahir Adolfo Beras",
    image: "airplane.jpg",
    accessKey: "0b?Bcm#u60i!bzz",
    role: "DEVELOPPER"
  },
  {
    name: "Elizabeth Moses",
    image: "airplane.jpg",
    accessKey: "2240b?Bcm#u60i!bzz",
    role: "DEVELOPPER"
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const authStatus = sessionStorage.getItem('mbt-auth');
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const authenticate = (accessKey: string): boolean => {
    const isValid = users.some(user => user.accessKey === accessKey);
    if (isValid) {
      setIsAuthenticated(true);
      sessionStorage.setItem('mbt-auth', 'authenticated');
      document.cookie = 'mbt-auth=authenticated; path=/; max-age=86400; SameSite=Strict';
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('mbt-auth');
    document.cookie = 'mbt-auth=; path=/; max-age=0';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
