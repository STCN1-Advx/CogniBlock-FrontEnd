'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './button';
import { UserDropdown } from './user-dropdown';
import { useUser } from '@/contexts/user-context';
import { popupOAuthLogin } from '@/lib/popup-oauth';

/**
 * Header 组件 - 页面顶部导航栏
 * 左侧显示Logo，右侧根据登录状态显示用户信息或登录按钮
 */
export function Header() {
  const { isAuthenticated, isLoading, refreshUser } = useUser();

  /**
   * 处理弹窗登录
   */
  const handleLogin = async () => {
    try {
      const result = await popupOAuthLogin();
      if (result.success) {
        // 登录成功后刷新用户状态
        await refreshUser();
      }
    } catch (error) {
      console.error('登录失败:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* 左侧Logo */}
        <Link href="/" className="flex items-center">
          <div className="w-16 h-8 sm:w-20 sm:h-10">
            <Image
              src="/logo.png"
              alt="CogniBlock Logo"
              width={160}
              height={80}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </Link>

        {/* 右侧内容 */}
        <div className="flex items-center space-x-4">
          {isLoading ? (
            // 加载状态
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : isAuthenticated ? (
            // 已登录状态 - 显示用户下拉菜单
            <>
              <Link href="/user">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100">
                  我的知识库
                </Button>
              </Link>
              <UserDropdown />
            </>
          ) : (
            // 未登录状态 - 显示登录按钮
            <Button 
              onClick={handleLogin}
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              登录
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}