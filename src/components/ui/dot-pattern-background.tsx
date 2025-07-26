'use client';

import React from 'react';

interface DotPatternBackgroundProps {
  /**
   * 点的颜色，默认为蓝色
   */
  dotColor?: string;
  /**
   * 点的透明度，默认为0.3
   */
  opacity?: number;
  /**
   * 点之间的间距，默认为66.67px
   */
  spacing?: number;
  /**
   * 点的半径，默认为1.76px
   */
  radius?: number;
  /**
   * 背景容器的类名
   */
  className?: string;
}

/**
 * 点阵背景组件
 * 使用CSS背景图案创建规律排列的圆点背景
 */
export function DotPatternBackground({
  dotColor = '#1C68FF',
  opacity = 0.3,
  spacing = 66.67,
  radius = 1.76,
  className = ''
}: DotPatternBackgroundProps) {
  
  /**
   * 生成SVG数据URL用作CSS背景
   */
  const generateDotPattern = () => {
    const svgContent = `
      <svg width="${spacing}" height="${spacing}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${spacing/2}" cy="${spacing/2}" r="${radius}" fill="${dotColor}" opacity="${opacity}"/>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  };
  
  return (
    <div 
      className={`absolute inset-0 ${className}`}
      style={{
        backgroundImage: `url("${generateDotPattern()}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: `${spacing}px ${spacing}px`,
        backgroundPosition: '0 0'
      }}
    />
  );
}

export default DotPatternBackground;