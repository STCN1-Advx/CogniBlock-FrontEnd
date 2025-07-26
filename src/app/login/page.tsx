'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * 登录页面组件
 * 提供OAuth外部授权登录功能
 */
export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 处理OAuth登录
   * 直接跳转到外部OAuth授权页面
   */
  const handleOAuthLogin = () => {
    setIsLoading(true);
    
    // 构建正确的回调URL
    const currentOrigin = window.location.origin;
    const redirectUri = `${currentOrigin}/auth/callback`;
    
    // 直接跳转到OAuth授权API端点，并传递正确的回调URL
    const authUrl = `http://183.131.51.193:8000/api/v2/auth/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = authUrl;
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
            <Button 
              onClick={handleOAuthLogin}
              className="w-full" 
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  正在跳转授权页面...
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
              <p>点击上方按钮将跳转到外部授权页面</p>
              <p className="mt-1">完成授权后将自动返回应用</p>
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