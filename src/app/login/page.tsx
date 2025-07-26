'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { popupOAuthLogin, isPopupSupported } from '@/lib/popup-oauth';

/**
 * 登录页面组件
 * 提供OAuth外部授权登录功能（弹窗和跳转两种方式）
 */
export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'popup' | 'redirect'>('popup');
  const [error, setError] = useState<string>('');
  
  // 获取API基础URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.cb.smart-teach.cn';

  /**
   * 处理弹窗OAuth登录
   */
  const handlePopupLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await popupOAuthLogin();
      
      if (result.success) {
        // 登录成功，跳转到首页
        router.push('/');
      } else {
        setError(result.error || '登录失败');
      }
    } catch (error) {
      console.error('弹窗登录错误:', error);
      setError('登录过程中发生错误，请重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * 处理跳转OAuth登录
   * 直接跳转到外部OAuth授权页面
   */
  const handleRedirectLogin = () => {
    setIsLoading(true);
    
    // 构建正确的回调URL
    const currentOrigin = window.location.origin;
    const redirectUri = `${currentOrigin}/auth/callback`;
    
    // 直接跳转到OAuth授权API端点，并传递正确的回调URL
    const authUrl = `${API_BASE_URL}/api/v2/auth/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = authUrl;
  };
  
  /**
   * 处理登录方法选择
   */
  const handleLogin = () => {
    if (loginMethod === 'popup') {
      handlePopupLogin();
    } else {
      handleRedirectLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">登录</CardTitle>
          <CardDescription>
            使用外部授权登录您的账户
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 登录方式选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">选择登录方式</label>
              <div className="flex space-x-2">
                <Button
                  variant={loginMethod === 'popup' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLoginMethod('popup')}
                  disabled={isLoading}
                  className="flex-1"
                >
                  弹窗登录
                </Button>
                <Button
                  variant={loginMethod === 'redirect' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLoginMethod('redirect')}
                  disabled={isLoading}
                  className="flex-1"
                >
                  跳转登录
                </Button>
              </div>
            </div>
            
            {/* 错误信息显示 */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            
            {/* 登录按钮 */}
            <Button 
              onClick={handleLogin}
              className="w-full" 
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {loginMethod === 'popup' ? '正在打开登录弹窗...' : '正在跳转授权页面...'}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-2 0V5H5v10h10v-1a1 1 0 112 0v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm7.707 3.293a1 1 0 010 1.414L9.414 10l1.293 1.293a1 1 0 01-1.414 1.414l-2-2a1 1 0 010-1.414l2-2a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  OAuth 授权登录
                </>
              )}
            </Button>
            
            <div className="text-center text-sm text-gray-500">
              {loginMethod === 'popup' ? (
                <>
                  <p>弹窗登录更加便捷，无需离开当前页面</p>
                  <p className="mt-1">如果弹窗被拦截，请选择跳转登录</p>
                </>
              ) : (
                <>
                  <p>点击上方按钮将跳转到外部授权页面</p>
                  <p className="mt-1">完成授权后将自动返回应用</p>
                </>
              )}
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              还没有账户？{' '}
              <Link href="/register" className="text-blue-600 hover:underline">
                立即注册
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}