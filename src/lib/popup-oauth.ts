'use client';

/**
 * 弹窗OAuth登录工具
 * 提供弹窗登录功能和父子窗口通信
 */

// 获取API基础URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.cb.smart-teach.cn';

/**
 * OAuth登录结果接口
 */
export interface OAuthResult {
  success: boolean;
  sessionId?: string;
  userId?: string;
  error?: string;
}

/**
 * 弹窗OAuth登录
 * @returns Promise<OAuthResult> 登录结果
 */
export function popupOAuthLogin(): Promise<OAuthResult> {
  return new Promise((resolve) => {
    // 弹窗参数
    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    // 打开OAuth登录弹窗
    const popup = window.open(
      `${API_BASE_URL}/api/v2/auth/login?popup=true`,
      'oauth_login',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
    
    if (!popup) {
      resolve({
        success: false,
        error: '无法打开弹窗，请检查浏览器弹窗拦截设置'
      });
      return;
    }
    
    // 监听来自弹窗的消息
    const messageHandler = (event: MessageEvent) => {
      console.log('收到消息:', event.origin, event.data);
      
      // 验证消息来源（弹窗回调页面来自API服务器）
      const apiOrigin = new URL(API_BASE_URL).origin;
      if (event.origin !== apiOrigin) {
        console.log('忽略来自未知来源的消息:', event.origin, '期望:', apiOrigin);
        return;
      }
      
      // 处理OAuth结果
      if (event.data && event.data.type === 'oauth_result') {
        console.log('处理OAuth结果:', event.data.payload);
        window.removeEventListener('message', messageHandler);
        popup.close();
        
        // 安全检查payload是否存在
        if (!event.data.payload) {
          console.error('OAuth结果payload为空');
          resolve({
            success: false,
            error: 'OAuth回调数据格式错误'
          });
          return;
        }
        
        const result = event.data.payload as OAuthResult;
        
        // 如果登录成功，设置cookie
        if (result.success && result.sessionId && result.userId) {
          console.log('设置Cookie:', result.sessionId, result.userId);
          setCookies(result.sessionId, result.userId);
        }
        
        resolve(result);
      }
    };
    
    // 监听弹窗关闭事件
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        resolve({
          success: false,
          error: '用户取消了登录'
        });
      }
    }, 1000);
    
    window.addEventListener('message', messageHandler);
  });
}

/**
 * 设置认证Cookie
 * @param sessionId 会话ID
 * @param userId 用户ID
 */
function setCookies(sessionId: string, userId: string) {
  // 设置cookie，确保与后端一致
  const domain = window.location.hostname === 'localhost' ? '' : '.smart-teach.cn';
  const secure = window.location.protocol === 'https:';
  
  const cookieOptions = [
    `path=/`,
    `max-age=${7 * 24 * 60 * 60}`, // 7天
    secure ? 'secure' : '',
    'samesite=lax',
    domain ? `domain=${domain}` : ''
  ].filter(Boolean).join('; ');
  
  document.cookie = `session-id=${sessionId}; ${cookieOptions}`;
  document.cookie = `x-user-id=${userId}; ${cookieOptions}`;
}

/**
 * 检查是否支持弹窗
 * @returns boolean 是否支持弹窗
 */
export function isPopupSupported(): boolean {
  try {
    const popup = window.open('', '_blank', 'width=1,height=1');
    if (popup) {
      popup.close();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * 清除认证Cookie
 */
export function clearAuthCookies() {
  const domain = window.location.hostname === 'localhost' ? '' : '.smart-teach.cn';
  const cookieOptions = [
    `path=/`,
    `expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    domain ? `domain=${domain}` : ''
  ].filter(Boolean).join('; ');
  
  document.cookie = `session-id=; ${cookieOptions}`;
  document.cookie = `x-user-id=; ${cookieOptions}`;
}