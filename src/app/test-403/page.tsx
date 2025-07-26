'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient, apiGet } from '@/lib/api-client';
import { getCurrentUser, getSessionStatus, logout, isLoggedIn, getCurrentUserSafe } from '@/lib/auth-api';

/**
 * 403错误测试页面
 * 用于测试全局403错误处理机制
 */
export default function Test403Page() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * 模拟触发403错误的API请求
   */
  const triggerForbiddenError = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      // 使用一个会返回403的测试端点
      const response = await apiClient('http://183.131.51.193:8000/api/v2/test/forbidden', {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        setResult('请求成功: ' + JSON.stringify(data));
      } else {
        setError(`请求失败: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError('请求错误: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 手动触发403错误处理
   */
  const manualTrigger403 = () => {
    // 创建一个模拟的403响应
    const mockResponse = new Response('Forbidden', { status: 403 });
    
    // 手动调用403处理逻辑
    if (typeof window !== 'undefined') {
      localStorage.setItem('session-id', 'test-session');
      localStorage.setItem('x-user-id', 'test-user');
      
      // 触发403错误事件
      const event = new CustomEvent('auth-error');
      window.dispatchEvent(event);
    }
  };

  /**
   * 检查当前登录状态（旧版本localStorage）
   */
  const checkLocalStorageAuth = () => {
    if (typeof window !== 'undefined') {
      const sessionId = localStorage.getItem('session-id');
      const userId = localStorage.getItem('x-user-id');
      const authToken = localStorage.getItem('auth_token');
      
      setResult(`LocalStorage状态（旧版本）:\n- session-id: ${sessionId || '未设置'}\n- x-user-id: ${userId || '未设置'}\n- auth_token: ${authToken || '未设置'}`);
    }
  };

  /**
   * 测试获取当前用户信息
   */
  const testGetCurrentUser = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const user = await getCurrentUser();
      setResult(`用户信息:\n${JSON.stringify(user, null, 2)}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError('获取用户信息失败: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 测试检查session状态
   */
  const testSessionStatus = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const status = await getSessionStatus();
      setResult(`Session状态:\n${JSON.stringify(status, null, 2)}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError('检查session状态失败: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 测试登出功能
   */
  const testLogout = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      await logout();
      setResult('登出成功，cookie和session已清除');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError('登出失败: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 测试登录状态检查
   */
  const testIsLoggedIn = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const loggedIn = await isLoggedIn();
      setResult(`登录状态: ${loggedIn ? '已登录' : '未登录'}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError('检查登录状态失败: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">403错误处理测试</CardTitle>
          <CardDescription>
            测试全局403错误处理机制
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              当任何API请求返回403 Forbidden时，系统会自动清除登录态（x-user-id 和 session-id）并跳转到登录页面。
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button 
              onClick={triggerForbiddenError}
              disabled={isLoading}
              variant="destructive"
              size="sm"
            >
              {isLoading ? '请求中...' : '触发403错误'}
            </Button>
            
            <Button 
              onClick={manualTrigger403}
              variant="outline"
              size="sm"
            >
              手动触发403处理
            </Button>
            
            <Button 
              onClick={checkLocalStorageAuth}
              variant="secondary"
              size="sm"
            >
              检查LocalStorage
            </Button>
            
            <Button 
              onClick={testGetCurrentUser}
              disabled={isLoading}
              variant="default"
              size="sm"
            >
              获取用户信息
            </Button>
            
            <Button 
              onClick={testSessionStatus}
              disabled={isLoading}
              variant="default"
              size="sm"
            >
              检查Session状态
            </Button>
            
            <Button 
              onClick={testIsLoggedIn}
              disabled={isLoading}
              variant="default"
              size="sm"
            >
              检查登录状态
            </Button>
            
            <Button 
              onClick={testLogout}
              disabled={isLoading}
              variant="destructive"
              size="sm"
            >
              登出
            </Button>
          </div>

          {result && (
            <Alert>
              <AlertDescription>
                <pre className="whitespace-pre-wrap text-sm">{result}</pre>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-gray-600">
            <h3 className="font-semibold mb-2">测试说明：</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>"触发403错误"：尝试请求一个会返回403的API端点</li>
              <li>"手动触发403处理"：直接触发403错误处理流程</li>
              <li>"检查LocalStorage"：查看旧版本localStorage中的认证信息</li>
              <li>"获取用户信息"：调用 /api/v2/auth/me 获取当前用户信息（需要认证）</li>
              <li>"检查Session状态"：调用 /api/v2/auth/session/status 检查session有效性</li>
              <li>"检查登录状态"：通过session状态判断是否已登录</li>
              <li>"登出"：调用 /api/v2/auth/logout 清除cookie和session</li>
            </ul>
            <div className="mt-3 p-2 bg-blue-50 rounded">
              <p className="text-blue-800 font-medium">新版本认证说明：</p>
              <p className="text-blue-700">后端现在使用cookie管理认证状态（x-user-id 和 session-id），不再依赖localStorage。</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}