'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


/**
 * 开屏页面组件
 * 提供OAuth外部授权登录功能
 */
export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  
  // 获取API基础URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.cb.smart-teach.cn';

  /**
   * 处理OAuth登录跳转
   */
  const handleOAuthLogin = () => {
    setIsLoading(true);
    
    // 构建回调URL
    const redirectUri = `${window.location.origin}/auth/callback`;
    const encodedRedirectUri = encodeURIComponent(redirectUri);
    
    // 直接跳转到OAuth授权页面
    window.location.href = `${API_BASE_URL}/api/v2/auth/login?redirect_uri=${encodedRedirectUri}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">欢迎使用 CogniBlock</CardTitle>
          <CardDescription>
            请使用外部授权登录系统
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={handleOAuthLogin}
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? '跳转中...' : 'OAuth 授权登录'}
            </Button>
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
