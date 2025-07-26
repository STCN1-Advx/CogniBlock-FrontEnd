'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getCurrentUser, logout, getSessionStatus, type UserInfo, type SessionStatus } from '@/lib/auth-api';

/**
 * 用户信息页面
 * 展示当前登录用户的信息和session状态
 */
export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * 加载用户信息和session状态
   */
  const loadUserData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 并行获取用户信息和session状态
      const [userInfo, sessionInfo] = await Promise.all([
        getCurrentUser().catch(() => null), // 如果获取失败，返回null
        getSessionStatus().catch(() => null)
      ]);

      setUser(userInfo);
      setSessionStatus(sessionInfo);

      // 如果用户信息获取失败，可能是未登录
      if (!userInfo) {
        setError('无法获取用户信息，可能未登录或session已过期');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载用户数据失败';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理登出
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // 登出成功后跳转到登录页面
      router.push('/login');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登出失败';
      setError(errorMessage);
    } finally {
      setIsLoggingOut(false);
    }
  };

  /**
   * 刷新数据
   */
  const handleRefresh = () => {
    loadUserData();
  };

  useEffect(() => {
    loadUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">加载用户信息中...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* 用户信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">用户信息</CardTitle>
            <CardDescription>
              当前登录用户的详细信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {user ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">用户ID</label>
                    <p className="text-lg font-mono">{user.id}</p>
                  </div>
                  {user.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">邮箱</label>
                      <p className="text-lg">{user.email}</p>
                    </div>
                  )}
                  {user.name && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">姓名</label>
                      <p className="text-lg">{user.name}</p>
                    </div>
                  )}
                </div>
                
                {/* 显示完整的用户数据 */}
                <div>
                  <label className="text-sm font-medium text-gray-500">完整用户数据</label>
                  <pre className="mt-2 p-3 bg-gray-50 rounded-md text-sm overflow-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">未获取到用户信息</p>
                <Button onClick={handleRefresh} className="mt-4" variant="outline">
                  重新加载
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session状态卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>Session状态</CardTitle>
            <CardDescription>
              当前session的有效性和详细信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessionStatus ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-500">状态:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    sessionStatus.valid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {sessionStatus.valid ? '有效' : '无效'}
                  </span>
                </div>
                
                {sessionStatus.user_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Session用户ID</label>
                    <p className="text-lg font-mono">{sessionStatus.user_id}</p>
                  </div>
                )}
                
                {sessionStatus.expires_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">过期时间</label>
                    <p className="text-lg">{new Date(sessionStatus.expires_at).toLocaleString()}</p>
                  </div>
                )}
                
                {/* 显示完整的session数据 */}
                <div>
                  <label className="text-sm font-medium text-gray-500">完整Session数据</label>
                  <pre className="mt-2 p-3 bg-gray-50 rounded-md text-sm overflow-auto">
                    {JSON.stringify(sessionStatus, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">未获取到session状态</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex justify-center space-x-4">
          <Button onClick={handleRefresh} variant="outline">
            刷新数据
          </Button>
          <Button 
            onClick={handleLogout} 
            variant="destructive"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? '登出中...' : '登出'}
          </Button>
          <Button onClick={() => router.push('/')} variant="secondary">
            返回首页
          </Button>
        </div>
      </div>
    </div>
  );
}