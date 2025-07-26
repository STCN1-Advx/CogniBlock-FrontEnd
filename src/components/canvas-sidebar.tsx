'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12.0042V21H21V12" stroke="#1C68FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.5 7.5L12 3L7.5 7.5" stroke="#1C68FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.9958 16V3" stroke="#1C68FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const VoiceIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.5 5.5C15.5 3.567 13.933 2 12 2C10.067 2 8.5 3.567 8.5 5.5V12C8.5 13.933 10.067 15.5 12 15.5C13.933 15.5 15.5 13.933 15.5 12V5.5Z" stroke="#1C68FF" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M4.5 11.5C4.5 15.6421 7.85785 19 12 19C16.1421 19 19.5 15.6421 19.5 11.5" stroke="#1C68FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 19V22" stroke="#1C68FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TextIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.5 3H4.5C3.67157 3 3 3.67157 3 4.5V19.5C3 20.3284 3.67157 21 4.5 21H19.5C20.3284 21 21 20.3284 21 19.5V4.5C21 3.67157 20.3284 3 19.5 3Z" stroke="#1C68FF" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M8 9.5V8H16V9.5" stroke="#1C68FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11 17H13" stroke="#1C68FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 9V17" stroke="#1C68FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
import 'katex/dist/katex.min.css';

/**
 * 可拖拽的卡片组件（用于从侧边栏拖拽到画布）
 */
function DraggableCardTemplate({ 
  id, 
  title, 
  content, 
  onDragStart 
}: { 
  id: string;
  title: string;
  content: string;
  onDragStart?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `template-${id}`,
    data: {
      type: 'template',
      template: {
        title,
        content
      }
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1000 : 1,
  };

  /**
   * 渲染连接端点
   */
  const renderConnectionPoints = () => {
    return (
      <>
        {/* 标题区域右侧连接点 */}
        <div 
          className="absolute rounded-full"
          style={{ 
            right: '-6px', 
            top: '14px',
            width: '12px',
            height: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.15)'
          }}
        >
          <div 
            className="absolute rounded-full"
            style={{
              left: '3px',
              top: '3px',
              width: '6px',
              height: '6px',
              backgroundColor: 'rgba(0, 0, 0, 0.2)'
            }}
          />
        </div>
        
        {/* 内容区域右侧连接点 */}
        <div 
          className="absolute rounded-full"
          style={{ 
            right: '-6px', 
            top: '53px',
            width: '12px',
            height: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.15)'
          }}
        >
          <div 
            className="absolute rounded-full"
            style={{
              left: '3px',
              top: '3px',
              width: '6px',
              height: '6px',
              backgroundColor: 'rgba(0, 0, 0, 0.2)'
            }}
          />
        </div>
      </>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`cursor-move ${isDragging ? 'opacity-50' : ''}`}
      {...listeners}
      {...attributes}
      onMouseDown={onDragStart}
    >
      <Card className="w-[214px] bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col border border-gray-300 relative">
        {/* 连接端点 */}
        {renderConnectionPoints()}
        
        {/* 卡片标题 */}
        <div className="relative bg-white border-b border-gray-300">
          <div className="flex items-start space-x-2.5 px-4 py-1.5">
            {/* 类型条 */}
            <div 
              className="w-[5px] h-[20px] rounded-[18px] mt-0.5"
              style={{ backgroundColor: '#D9D9D9' }}
            />
            
            <div className="flex-1">
              <h3 className="text-xs font-semibold text-gray-950 leading-tight mb-0.5">
                {title}
              </h3>
              <p className="text-[10px] text-gray-600">
                2024-07-24
              </p>
            </div>
          </div>
        </div>
        
        {/* 卡片内容 */}
        <div className="flex-1 px-[14px] py-3 bg-[#FAFAFA] border border-gray-300">
          <div className="space-y-2">
            <div>
              <h4 className="text-xs font-medium text-gray-950 mb-1">小标题1</h4>
              <div className="text-[10px] text-gray-850 leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-medium text-gray-950 mb-1">小标题2</h4>
              <div className="text-[10px] text-gray-850 leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * 操作按钮组件
 */
function ActionButton({ 
  icon, 
  onClick, 
  className = "" 
}: { 
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`h-6 w-6 p-0 hover:bg-blue-50 ${className}`}
    >
      {icon}
    </Button>
  );
}

/**
 * AI分析状态组件
 */
function AIAnalysisStatus() {
  return (
    <div className="w-full p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="flex items-center justify-center mb-2">
        {/* 星星图标组合 */}
        <div className="relative w-6 h-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L14.09 8.26L20 10L14.09 11.74L12 18L9.91 11.74L4 10L9.91 8.26L12 2Z" fill="#D9D9D9" />
            <path d="M18 6L19.5 9.5L23 11L19.5 12.5L18 16L16.5 12.5L13 11L16.5 9.5L18 6Z" fill="#D9D9D9" />
            <path d="M6 8L7 10.5L9.5 11.5L7 12.5L6 15L5 12.5L2.5 11.5L5 10.5L6 8Z" fill="#D9D9D9" />
          </svg>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900 mb-1">
          AI 正在分析
        </p>
        <p className="text-xs text-gray-600">
          喝杯茶，坐享其成
        </p>
      </div>
    </div>
  );
}

/**
 * 画布右侧边栏组件
 */
export function CanvasSidebar() {
  const [activeTab, setActiveTab] = useState<'my-cards' | 'community'>('my-cards');

  // 示例卡片数据
  const sampleCard = {
    id: 'sample-1',
    title: '第一章-集合',
    content: '若函数在闭区间[a,b]上单调递增，则f(a)为最小值，f(b)为最大值；若函数在闭区间[a,b]上单调递减，则f(a)为最大值，f(b)为最小值；对于非单调函数，需结合导数找到极值点，再与端点值比较确定最值。'
  };

  /**
   * 处理上传按钮点击
   */
  const handleUpload = () => {
    console.log('上传文件');
  };

  /**
   * 处理录音按钮点击
   */
  const handleVoice = () => {
    console.log('开始录音');
  };

  /**
   * 处理文字按钮点击
   */
  const handleText = () => {
    console.log('添加文字');
  };

  return (
    <div 
      className="fixed right-0 top-0 h-full z-40"
      style={{
        width: '269px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '2px solid #D5D5D5',
        borderRadius: '25px 0px 0px 25px'
      }}
    >
      <div className="h-full flex flex-col p-7">
        {/* 示例卡片 */}
        <div className="mb-6">
          <DraggableCardTemplate
            id={sampleCard.id}
            title={sampleCard.title}
            content={sampleCard.content}
          />
        </div>
        
        {/* 标签切换 */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('my-cards')}
            className={`text-base font-semibold ${
              activeTab === 'my-cards' 
                ? 'text-gray-950' 
                : 'text-gray-600'
            }`}
          >
            我的卡片
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`text-base font-semibold ${
              activeTab === 'community' 
                ? 'text-gray-950' 
                : 'text-gray-600'
            }`}
          >
            社区
          </button>
        </div>
        
        {/* AI分析状态 */}
        <div className="mb-6">
          <AIAnalysisStatus />
        </div>
        
        {/* 底部操作按钮 */}
        <div className="mt-auto">
          <div 
            className="flex justify-center items-center py-5 bg-white border-2 border-gray-300"
            style={{
              marginLeft: '-11px',
              marginRight: '-28px',
              width: '291px',
              height: '64px'
            }}
          >
            {/* 上传按钮 */}
            <ActionButton
              icon={<UploadIcon />}
              onClick={handleUpload}
              className="mx-[23px]"
            />
            
            {/* 录音按钮 */}
            <ActionButton
              icon={<VoiceIcon />}
              onClick={handleVoice}
              className="mx-[23px]"
            />
            
            {/* 文字按钮 */}
            <ActionButton
              icon={<TextIcon />}
              onClick={handleText}
              className="mx-[23px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}