'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';

/**
 * 工具栏项目类型定义
 */
interface ToolbarItem {
  id: string;
  name: string;
  icon: string;
  isActive?: boolean;
}

/**
 * 工具栏组件属性
 */
interface ToolbarProps {
  onItemClick?: (itemId: string) => void;
  className?: string;
  activeItem?: string;
}

/**
 * 右侧工具栏组件
 * 基于Figma设计的垂直工具栏，包含多个图标按钮
 */
export function Toolbar({ onItemClick, className = '', activeItem: externalActiveItem }: ToolbarProps) {
  const [internalActiveItem, setInternalActiveItem] = useState<string>('component');
  const activeItem = externalActiveItem || internalActiveItem;
  const activeIndicatorRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 工具栏项目配置
  const toolbarItems: ToolbarItem[] = [
    {
      id: 'component',
      name: '组件',
      icon: '/icons/component.svg'
    },
    {
      id: 'connection',
      name: '连接',
      icon: '/icons/connection.svg'
    },
    {
      id: 'pencil',
      name: '铅笔',
      icon: '/icons/pencil.svg'
    },
    {
      id: 'search',
      name: '搜索',
      icon: '/icons/search.svg'
    },
    {
      id: 'bookmark',
      name: '书签',
      icon: '/icons/bookmark.svg'
    }
  ];

  /**
   * 初始化活动指示器位置
   */
  useEffect(() => {
    if (activeIndicatorRef.current && itemRefs.current[activeItem]) {
      const targetElement = itemRefs.current[activeItem];
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const containerRect = targetElement.parentElement?.getBoundingClientRect();
        if (containerRect) {
          const offsetY = rect.top - containerRect.top;
          gsap.set(activeIndicatorRef.current, { y: offsetY });
        }
      }
    }
  }, []);

  /**
   * 处理项目点击事件
   */
  const handleItemClick = (itemId: string) => {
    if (itemId === activeItem) return;
    
    const targetElement = itemRefs.current[itemId];
    if (targetElement && activeIndicatorRef.current) {
      const rect = targetElement.getBoundingClientRect();
      const containerRect = targetElement.parentElement?.getBoundingClientRect();
      if (containerRect) {
        const offsetY = rect.top - containerRect.top;
        
        // 使用GSAP Spring动画移动活动指示器
        gsap.to(activeIndicatorRef.current, {
          y: offsetY,
          duration: 0.6,
          ease: "back.out(1.7)",
        });
      }
    }
    
    if (!externalActiveItem) {
      setInternalActiveItem(itemId);
    }
    onItemClick?.(itemId);
  };

  return (
    <div className={`fixed left-4 top-1/2 transform -translate-y-1/2 z-40 ${className}`}>
      <div className="bg-white/80 backdrop-blur-[10px] border-2 border-[#D5D5D5] rounded-[30px] p-[10px]">
        <div className="flex flex-col gap-[9px] relative">
          {/* 活动指示器 - 蓝色圆形背景 */}
          <div 
            ref={activeIndicatorRef}
            className="absolute w-[38px] h-[38px] rounded-[19px] bg-[#1C68FF] pointer-events-none"
            style={{ top: 0, left: 0 }}
          />
          
          {toolbarItems.map((item, index) => {
            const isActive = activeItem === item.id;
            return (
              <div 
                key={item.id} 
                ref={(el) => { itemRefs.current[item.id] = el; }}
                className="relative w-[38px] h-[38px]"
              >
                {/* 图标按钮 */}
                <button
                  onClick={() => handleItemClick(item.id)}
                  className="absolute top-[10px] left-[10px] w-[18px] h-[18px] flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
                  title={item.name}
                >
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={18}
                    height={18}
                    className="transition-all duration-200"
                    style={{
                      filter: isActive 
                        ? 'brightness(0) invert(1)' // #FFFFFF白色
                        : 'brightness(0) saturate(100%) invert(11%) sepia(100%) saturate(4000%) hue-rotate(220deg) brightness(100%) contrast(100%)' // #1C68FF蓝色
                    }}
                  />
                </button>
              </div>
            );
          })}
        </div>
        
        {/* 底部头像/用户图标 */}
        <div className="mt-[9px] w-[38px] h-[38px] rounded-full overflow-hidden bg-gray-200">
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-white text-sm font-medium">U</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Toolbar;