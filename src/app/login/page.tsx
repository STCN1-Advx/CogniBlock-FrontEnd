'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { popupOAuthLogin } from '@/lib/popup-oauth';

/**
 * 登录页面组件
 * 提供OAuth外部授权登录功能
 */
export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  /**
   * 处理OAuth登录
   */
  const handleLogin = async () => {
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
      console.error('登录错误:', error);
      setError('登录过程中发生错误，请重试');
    } finally {
      setIsLoading(false);
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
            {/* 错误信息显示 */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            
            {/* 登录按钮 */}
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? '登录中...' : '登录'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}