'use client';

import { apiGet, apiPost } from './api-client';

/**
 * 认证相关API接口
 */

// 使用本地代理路径
const API_BASE_URL = '';

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  [key: string]: any;
}

/**
 * Session状态接口
 */
export interface SessionStatus {
  valid: boolean;
  user_id?: string;
  expires_at?: string;
  [key: string]: any;
}

/**
 * 获取当前用户信息
 * 需要认证，无效session时返回403
 */
export async function getCurrentUser(): Promise<UserInfo> {
  return apiGet<UserInfo>(`${API_BASE_URL}/api/v2/auth/me`);
}

/**
 * 根据用户ID获取用户信息
 * @param userId 用户ID
 */
export async function getUserById(userId: string): Promise<UserInfo> {
  return apiGet<UserInfo>(`${API_BASE_URL}/api/v2/users/${userId}`);
}

/**
 * 检查session状态
 * 可选认证，返回当前session的有效性
 */
export async function getSessionStatus(): Promise<SessionStatus> {
  return apiGet<SessionStatus>(`${API_BASE_URL}/api/v2/auth/session/status`);
}

/**
 * 登出
 * 清除cookie、localStorage和session
 */
export async function logout(): Promise<void> {
  // 清除 localStorage 中的认证信息
  clearAuthFromLocalStorage();
  
  // 调用API登出
  return apiPost<void>(`${API_BASE_URL}/api/v2/auth/logout`);
}

/**
 * 从 localStorage 获取认证信息
 */
function getAuthFromLocalStorage(): { sessionId: string | null; userId: string | null } {
  if (typeof window === 'undefined') return { sessionId: null, userId: null };
  
  try {
    const sessionId = localStorage.getItem('session-id');
    const userId = localStorage.getItem('x-user-id');
    return { sessionId, userId };
  } catch (error) {
    console.warn('无法读取 localStorage:', error);
    return { sessionId: null, userId: null };
  }
}

/**
 * 设置认证信息到 localStorage
 */
function setAuthToLocalStorage(sessionId: string, userId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('session-id', sessionId);
    localStorage.setItem('x-user-id', userId);
  } catch (error) {
    console.warn('无法写入 localStorage:', error);
  }
}

/**
 * 清除 localStorage 中的认证信息
 */
function clearAuthFromLocalStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('session-id');
    localStorage.removeItem('x-user-id');
  } catch (error) {
    console.warn('无法清除 localStorage:', error);
  }
}

/**
 * 检查Cookie中是否存在认证信息
 */
function hasAuthCookies(): boolean {
  if (typeof document === 'undefined') return false;
  
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  return !!(cookies['session-id'] && cookies['x-user-id']);
}

/**
 * 获取Cookie中的用户ID
 */
function getUserIdFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  return cookies['x-user-id'] || null;
}

/**
 * 检查是否存在认证信息（优先检查 localStorage，然后检查 Cookie）
 * 如果 localStorage 为空但 Cookie 中有认证信息，则同步到 localStorage
 */
function hasAuthInfo(): boolean {
  const localStorageAuth = getAuthFromLocalStorage();
  if (localStorageAuth.sessionId && localStorageAuth.userId) {
    return true;
  }
  
  // 检查 Cookie 中是否有认证信息
  if (hasAuthCookies()) {
    // 如果 Cookie 中有认证信息但 localStorage 为空，则同步到 localStorage
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    const sessionId = cookies['session-id'];
    const userId = cookies['x-user-id'];
    
    if (sessionId && userId) {
      setAuthToLocalStorage(sessionId, userId);
      return true;
    }
  }
  
  return false;
}

/**
 * 获取用户ID（优先从 localStorage，然后从 Cookie）
 * 如果 localStorage 为空但 Cookie 中有用户ID，则同步到 localStorage
 */
function getUserId(): string | null {
  const localStorageAuth = getAuthFromLocalStorage();
  if (localStorageAuth.userId) {
    return localStorageAuth.userId;
  }
  
  // 如果 localStorage 为空，检查 Cookie
  const cookieUserId = getUserIdFromCookie();
  if (cookieUserId && hasAuthCookies()) {
    // 同步 Cookie 中的认证信息到 localStorage
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    const sessionId = cookies['session-id'];
    if (sessionId) {
      setAuthToLocalStorage(sessionId, cookieUserId);
    }
  }
  
  return cookieUserId;
}

/**
 * 检查用户是否已登录
 * 优先检查 localStorage，然后检查 Cookie 中的 session-id 和 x-user-id
 */
export function isLoggedIn(): boolean {
  return hasAuthInfo();
}

/**
 * 安全的获取用户信息
 * 如果未登录或session无效，返回null而不抛出错误
 * 优先从 localStorage 获取认证信息，然后从 Cookie
 */
export async function getCurrentUserSafe(): Promise<UserInfo | null> {
  try {
    // 首先检查是否有认证信息（localStorage 或 Cookie）
    if (!hasAuthInfo()) {
      return null;
    }
    
    // 尝试获取用户ID并直接获取用户信息
    const userId = getUserId();
    if (userId) {
      try {
        return await getUserById(userId);
      } catch (userError) {
        console.warn('无法通过用户ID获取用户信息，尝试使用me接口:', userError);
        // 如果通过用户ID获取失败，尝试使用me接口
        try {
          return await getCurrentUser();
        } catch (meError) {
          console.warn('me接口也失败，创建基本用户信息:', meError);
          // 如果两个接口都失败，但有认证信息，创建一个基本的用户对象
          return {
            id: userId,
            name: '用户',
            email: '',
            avatar: ''
          };
        }
      }
    }
    
    // 如果没有用户ID，尝试使用原有的me接口
    return await getCurrentUser();
  } catch (error) {
    // 如果获取失败（如403错误），返回null
    console.warn('获取用户信息完全失败:', error);
    return null;
  }
}

/**
 * 导出 localStorage 认证管理函数
 */
export { setAuthToLocalStorage, clearAuthFromLocalStorage, getAuthFromLocalStorage };