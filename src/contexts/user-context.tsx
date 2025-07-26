'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserInfo, getCurrentUserSafe, isLoggedIn, clearAuthFromLocalStorage } from '@/lib/auth-api';

/**
 * 用户上下文接口
 */
interface UserContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

/**
 * 用户上下文
 */
const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * 用户上下文提供者组件
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 刷新用户信息
   */
  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const loggedIn = isLoggedIn();
      if (loggedIn) {
        const userInfo = await getCurrentUserSafe();
        setUser(userInfo);
        setIsAuthenticated(!!userInfo);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 登出处理
   */
  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // 清除 localStorage 中的认证信息
    clearAuthFromLocalStorage();
    // 清除 Cookie 中的认证信息
    document.cookie = 'x-user-id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'session-id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  // 组件挂载时获取用户信息
  useEffect(() => {
    refreshUser();
  }, []);

  const value: UserContextType = {
    user,
    isAuthenticated,
    isLoading,
    refreshUser,
    logout: handleLogout
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * 使用用户上下文的Hook
 */
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}