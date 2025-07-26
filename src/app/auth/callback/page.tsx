'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

/**
 * OAuth授权回调内容组件
 * 处理OAuth授权服务器返回的授权码
 */
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('正在处理授权...');
  
  // 获取API基础URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.cb.smart-teach.cn';

  useEffect(() => {
    /**
     * 处理OAuth回调
     */
    const handleCallback = async () => {
      try {
        // 获取URL参数
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const state = searchParams.get('state');
        const errorDescription = searchParams.get('error_description');

        // 处理授权错误
        if (error) {
          const errorMsg = errorDescription || error;
          setStatus('error');
          setMessage(`授权失败: ${errorMsg}`);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('未收到授权码');
          return;
        }

        // 构建回调API URL，包含所有必要参数
        const callbackUrl = new URL(`${API_BASE_URL}/api/v2/auth/oauth/callback`);
        callbackUrl.searchParams.set('code', code);
        if (state) {
          callbackUrl.searchParams.set('state', state);
        }

        // 调用后端API处理OAuth回调
        const response = await apiClient(callbackUrl.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          // 后端现在通过cookie设置认证信息（x-user-id 和 session-id）
          // 不再需要手动保存到localStorage
          
          setStatus('success');
          setMessage('登录成功，正在跳转...');
          
          // 延迟跳转到首页
          setTimeout(() => {
            router.push('/');
          }, 1500);
        } else {
          const errorData = await response.json();
          setStatus('error');
          setMessage(`登录失败: ${errorData.message || '未知错误'}`);
        }
      } catch (error) {
        console.error('OAuth回调处理错误:', error);
        setStatus('error');
        setMessage('网络错误，请稍后重试');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  /**
   * 获取状态对应的样式
   */
  const getStatusStyle = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  /**
   * 获取状态图标
   */
  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        );
      case 'success':
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-4">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full mx-auto mb-4">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">授权处理</CardTitle>
          <CardDescription>
            正在处理您的登录授权
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {getStatusIcon()}
          <p className={`text-lg font-medium ${getStatusStyle()}`}>
            {message}
          </p>
          {status === 'error' && (
            <div className="mt-4">
              <button
                onClick={() => router.push('/login')}
                className="text-blue-600 hover:underline"
              >
                返回登录页面
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * OAuth授权回调页面
 * 使用 Suspense 包装以满足 Next.js 要求
 */
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">授权处理</CardTitle>
            <CardDescription>
              正在处理您的登录授权
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-blue-600">
              正在加载...
            </p>
          </CardContent>
        </Card>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}