'use client';

import { apiGet, apiPost } from './api-client';

/**
 * 认证相关API接口
 */

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
  return apiGet<UserInfo>('http://183.131.51.193:8000/api/v2/auth/me');
}

/**
 * 检查session状态
 * 可选认证，返回当前session的有效性
 */
export async function getSessionStatus(): Promise<SessionStatus> {
  return apiGet<SessionStatus>('http://183.131.51.193:8000/api/v2/auth/session/status');
}

/**
 * 登出
 * 清除cookie和session
 */
export async function logout(): Promise<void> {
  return apiPost<void>('http://183.131.51.193:8000/api/v2/auth/logout');
}

/**
 * 检查用户是否已登录
 * 通过检查session状态来判断
 */
export async function isLoggedIn(): Promise<boolean> {
  try {
    const status = await getSessionStatus();
    return status.valid;
  } catch (error) {
    // 如果请求失败，认为未登录
    return false;
  }
}

/**
 * 安全的获取用户信息
 * 如果未登录或session无效，返回null而不抛出错误
 */
export async function getCurrentUserSafe(): Promise<UserInfo | null> {
  try {
    return await getCurrentUser();
  } catch (error) {
    // 如果获取失败（如403错误），返回null
    return null;
  }
}