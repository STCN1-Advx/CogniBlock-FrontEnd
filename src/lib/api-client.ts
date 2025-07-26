'use client';

/**
 * 全局API客户端
 * 提供统一的HTTP请求处理和403错误拦截
 */

/**
 * 清除登录态
 * 清除localStorage中的认证信息（保留兼容性）
 */
function clearAuthState() {
  if (typeof window !== 'undefined') {
    // 清除可能存在的旧版本localStorage数据
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('x-user-id');
    localStorage.removeItem('session-id');
    
    // 注意：实际的认证状态现在由后端cookie管理
    // 这里只是清除可能残留的旧数据
  }
}

/**
 * 跳转到登录页面
 */
function redirectToLogin() {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/**
 * 处理403错误
 * 清除登录态并触发全局认证错误事件
 */
function handle403Error() {
  clearAuthState();
  
  // 触发全局认证错误事件，由AuthGuard组件处理跳转
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('auth-error');
    window.dispatchEvent(event);
  }
}

/**
 * 增强的fetch函数
 * 自动处理403错误，使用cookie进行认证
 */
export async function apiClient(
  url: string | URL | Request,
  options: RequestInit = {}
): Promise<Response> {
  try {
    // 确保发送cookie进行认证
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // 自动发送cookie（x-user-id 和 session-id）
      headers: {
        ...options.headers,
      },
    });

    // 检查403错误
    if (response.status === 403) {
      console.warn('收到403 Forbidden响应，session-id已过期');
      handle403Error();
      throw new Error('Session expired');
    }

    return response;
  } catch (error) {
    // 如果是网络错误或其他错误，直接抛出
    throw error;
  }
}

/**
 * 便捷的JSON API请求函数
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await apiClient(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * GET请求
 */
export function apiGet<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'GET',
  });
}

/**
 * POST请求
 */
export function apiPost<T = any>(
  url: string,
  data?: any,
  options: RequestInit = {}
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT请求
 */
export function apiPut<T = any>(
  url: string,
  data?: any,
  options: RequestInit = {}
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE请求
 */
export function apiDelete<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'DELETE',
  });
}

/**
 * 导出清除登录态函数供其他组件使用
 */
export { clearAuthState, redirectToLogin };