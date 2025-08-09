'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { popupOAuthLogin } from '@/lib/popup-oauth';

/**
 * 登录页面组件
 * 提供OAuth外部授权登录功能
 */
export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [clickCount, setClickCount] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [username, setUsername] = useState('');
  const [demoError, setDemoError] = useState<string>('');

  /**
   * 处理背景点击，连续点击10次切换到演示模式
   */
  const handleBackgroundClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount >= 10) {
      setIsDemoMode(true);
      setClickCount(0);
      setError('');
      setDemoError('');
    }
  };

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

  /**
   * 处理演示登录
   */
  const handleDemoLogin = async () => {
    if (!username.trim()) {
      setDemoError('请输入用户名');
      return;
    }

    setIsLoading(true);
    setDemoError('');
    
    try {
       const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
       const response = await fetch(`${apiBaseUrl}/api/v2/auth/demologin`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({ username: username.trim() }),
       });

      const data = await response.json();

      if (response.ok) {
        // 演示登录成功，跳转到首页
        router.push('/');
      } else {
        setDemoError(data.detail || '演示登录失败');
      }
    } catch (error) {
      console.error('演示登录错误:', error);
      setDemoError('演示登录过程中发生错误，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 切换回普通登录模式
   */
  const switchToNormalMode = () => {
    setIsDemoMode(false);
    setUsername('');
    setDemoError('');
    setClickCount(0);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4" 
      onClick={handleBackgroundClick}
    >
      <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isDemoMode ? '演示登录' : '登录'}
          </CardTitle>
          <CardDescription>
            {isDemoMode 
              ? '开发和测试环境的快速登录' 
              : '使用外部授权登录您的账户'
            }
          </CardDescription>
          {!isDemoMode && clickCount > 0 && (
            <div className="text-xs text-gray-500 mt-2">
              点击背景 {clickCount}/10 次切换到演示模式
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 错误信息显示 */}
            {(error || demoError) && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error || demoError}
              </div>
            )}
            
            {isDemoMode ? (
              /* 演示登录模式 */
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">用户名</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="请输入用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleDemoLogin();
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Button
                    onClick={handleDemoLogin}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isLoading ? '登录中...' : '演示登录'}
                  </Button>
                  
                  <Button
                    onClick={switchToNormalMode}
                    variant="outline"
                    className="w-full"
                  >
                    切换到普通登录
                  </Button>
                </div>
              </>
            ) : (
              /* 普通登录模式 */
              <Button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? '登录中...' : '登录'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}