import React from 'react';

/**
 * 画板页面专用布局
 * 不包含Header，提供全屏画板体验
 */
export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}