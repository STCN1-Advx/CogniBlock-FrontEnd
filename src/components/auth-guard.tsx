'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearAuthState } from '@/lib/api-client';

/**
 * 全局认证守卫组件
 * 监听全局的认证状态变化和错误处理
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    /**
     * 处理全局的认证错误
     */
    const handleAuthError = (event: CustomEvent) => {
      console.warn('检测到认证错误，清除登录态并跳转到登录页面');
      clearAuthState();
      router.push('/login');
    };

    /**
     * 监听全局的403错误事件
     */
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.error?.message === 'Session expired') {
        handleAuthError(event as any);
      }
    };

    /**
     * 监听未处理的Promise拒绝
     */
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message === 'Session expired') {
        handleAuthError(event as any);
      }
    };

    // 添加事件监听器
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('auth-error', handleAuthError as EventListener);

    // 清理函数
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('auth-error', handleAuthError as EventListener);
    };
  }, [router]);

  return <>{children}</>;
}

/**
 * 触发全局认证错误事件的工具函数
 */
export function triggerAuthError() {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('auth-error');
    window.dispatchEvent(event);
  }
}