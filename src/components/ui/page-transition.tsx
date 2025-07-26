'use client'

import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

/**
 * 页面过渡动画组件（简化版）
 * 暂时移除framer-motion以避免兼容性问题
 */
export function PageTransition({ children }: PageTransitionProps) {
  return (
    <div className="w-full h-full">
      {children}
    </div>
  )
}