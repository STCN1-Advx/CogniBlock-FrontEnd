import React from 'react';
import { DotPatternBackground } from './dot-pattern-background';

/**
 * 全局背景组件
 * 提供统一的明亮背景色和点阵图案
 */
export function GlobalBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#FAFAFA' }}>
      {/* 全局点阵背景 */}
      <DotPatternBackground 
        dotColor="#66ccff" 
        opacity={0.4} 
        spacing={20} 
        radius={1.5}
        className="fixed inset-0 z-0"
      />
      {/* 页面内容 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}