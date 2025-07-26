'use client';

import { usePathname } from 'next/navigation';
import { Header } from './header';
import { PageTransition } from './page-transition';

/**
 * 条件性渲染Header组件
 * 根据当前路径决定是否显示Header
 */
export function ConditionalHeader() {
  const pathname = usePathname();
  
  // 检查是否为画布页面
  const isCanvasPage = pathname.startsWith('/canvas/');
  
  if (isCanvasPage) {
    // 画布页面不显示Header
    return null;
  }
  
  // 其他页面显示Header
  return <Header />;
}

/**
 * 条件性布局包装器
 * 根据是否有Header调整内容区域的样式，并添加页面过渡动画
 */
export function ConditionalWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCanvasPage = pathname.startsWith('/canvas/');
  
  // 使用统一的className来避免水合错误
  const wrapperClass = isCanvasPage ? '' : 'pt-20';
  
  return (
    <div className={wrapperClass}>
      <PageTransition>
        {children}
      </PageTransition>
    </div>
  );
}