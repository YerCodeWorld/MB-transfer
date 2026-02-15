"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Employee } from '@/types/auth';
import { apiClient } from '@/utils/api';

interface AuthContextType {
	isAuthenticated: boolean;
	employee: Employee | null;
	isLoading: boolean;
	authenticate: (identifier: string, accessKey: string) => Promise<boolean>;
	logout: () => void;
	refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auto-initialize from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('mbt-token');
        const storedEmployee = localStorage.getItem('mbt-employee');

        if (storedToken && storedEmployee) {
          // Set token in API client
          apiClient.setToken(storedToken);

          // Validate token by fetching current user
          try {
            const response = await apiClient.getMe();
            if (response.success && response.data?.employee) {
              setEmployee(response.data.employee);
              setIsAuthenticated(true);
              // Update stored employee data
              localStorage.setItem('mbt-employee', JSON.stringify(response.data.employee));
            } else {
              // Token invalid, clear storage
              clearAuthStorage();
            }
          } catch (error) {
            // Token validation failed, clear storage
            console.error('Token validation failed:', error);
            clearAuthStorage();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const authenticate = async (identifier: string, accessKey: string): Promise<boolean> => {
    try {
      const response = await apiClient.login(identifier, accessKey);

      if (response.success && response.data?.token && response.data?.employee) {
        const { token, employee: employeeData } = response.data;

        // Store token and employee data
        localStorage.setItem('mbt-token', token);
        localStorage.setItem('mbt-employee', JSON.stringify(employeeData));

        // Set cookie for middleware
        document.cookie = 'mbt-auth=authenticated; path=/; max-age=86400; SameSite=Strict';

        // Set token in API client
        apiClient.setToken(token);

        // Update state
        setEmployee(employeeData);
        setIsAuthenticated(true);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  };

  const logout = () => {
    clearAuthStorage();
    setIsAuthenticated(false);
    setEmployee(null);
  };

  const refreshAuth = async () => {
    try {
      const response = await apiClient.refreshToken();

      if (response.success && response.data?.token && response.data?.employee) {
        const { token, employee: employeeData } = response.data;

        // Update stored token and employee data
        localStorage.setItem('mbt-token', token);
        localStorage.setItem('mbt-employee', JSON.stringify(employeeData));

        // Set token in API client
        apiClient.setToken(token);

        // Update state
        setEmployee(employeeData);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
    }
  };

  const clearAuthStorage = () => {
    localStorage.removeItem('mbt-token');
    localStorage.removeItem('mbt-employee');
    document.cookie = 'mbt-auth=; path=/; max-age=0';
    apiClient.clearToken();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, employee, isLoading, authenticate, logout, refreshAuth }}>
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
