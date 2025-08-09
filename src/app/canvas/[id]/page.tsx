'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  FileText, 
  Image as ImageIcon, 
  Link as LinkIcon,
  StickyNote,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move
} from 'lucide-react';
import { useHeaderAwarePositioning } from '@/hooks/use-header-aware-positioning';
import { Toolbar } from '@/components/ui/toolbar';
import { CanvasSidebar } from '@/components/canvas-sidebar';
import { useUser } from '@/contexts/user-context';
import { pullCanvasState, pushCanvasState, RawCardResponse, getContentById, ContentDetail } from '@/lib/canvas-api';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  useDraggable,
  useDroppable,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

/**
 * 格式化时间戳为更美观的显示格式
 * @param isoString ISO 格式的时间戳
 * @returns 格式化后的时间字符串
 */
function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // 如果是今天
    if (diffDays === 0) {
      if (diffMinutes < 1) {
        return '刚刚';
      } else if (diffMinutes < 60) {
        return `${diffMinutes}分钟前`;
      } else {
        return `${diffHours}小时前`;
      }
    }
    // 如果是昨天
    else if (diffDays === 1) {
      return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
    }
    // 如果是一周内
    else if (diffDays < 7) {
      return `${diffDays}天前`;
    }
    // 如果是今年
    else if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    }
    // 其他情况显示完整日期
    else {
      return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
  } catch (error) {
    // 如果解析失败，返回原始字符串
    return isoString;
  }
}

// 知识项数据类型定义
interface KnowledgeItem {
  id: string;
  type: 'text' | 'image' | 'link' | 'note';
  title: string;
  content: string;
  // Markdown+LaTeX 总结内容
  summary: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  // 相对于画布中心的绝对距离
  centerOffset: { x: number; y: number };
  // 层级数字
  zIndex: number;
  // 颜色
  color: string;
  // 连接端点
  connectionPoints: {
    title: { left: boolean; right: boolean };
    content: { left: boolean; right: boolean };
  };
  createdAt: string;
  updatedAt: string;
}

// 知识库数据类型定义
interface KnowledgeBase {
  id: string;
  title: string;
  description: string;
  items: KnowledgeItem[];
}

/**
 * 可拖拽的知识项卡片组件
 */
function DraggableKnowledgeItemCard({ 
  item, 
  onEdit, 
  onDelete,
  onCardClick,
  isSelected = false
}: { 
  item: KnowledgeItem;
  onEdit: (item: KnowledgeItem) => void;
  onDelete: (id: string) => void;
  onCardClick?: (itemId: string) => void;
  isSelected?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: item.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    left: item.position.x,
    top: item.position.y,
    width: item.size.width,
    height: item.size.height,
    minWidth: '200px',
    minHeight: '120px',
    zIndex: isDragging ? 1000 : item.zIndex,
  };

  /**
   * 获取类型对应的图标
   */
  const getIcon = () => {
    switch (item.type) {
      case 'text': return <FileText className="w-4 h-4" />;
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'link': return <LinkIcon className="w-4 h-4" />;
      case 'note': return <StickyNote className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  /**
   * 获取卡片的颜色样式
   */
  const getCardStyle = () => {
    // 使用卡片的自定义颜色
    const borderColor = item.color + '40'; // 添加透明度
    const bgColor = item.color + '10'; // 更淡的背景色
    return {
      borderColor: borderColor,
      backgroundColor: bgColor
    };
  };

  /**
    * 渲染连接端点
    */
   const renderConnectionPoints = () => {
     const points = [];
     
     // 标题区域的连接点 (绿色)
     if (item.connectionPoints.title.left) {
       points.push(
         <div 
           key="title-left"
           className="absolute rounded-full"
           style={{ 
             left: '-6px', 
             top: '22px',
             width: '12px',
             height: '12px',
             backgroundColor: 'rgba(0, 206, 69, 0.2)'
           }}
         >
           <div 
             className="absolute rounded-full"
             style={{
               left: '3px',
               top: '3px',
               width: '6px',
               height: '6px',
               backgroundColor: '#00CE45'
             }}
           />
         </div>
       );
     }
     if (item.connectionPoints.title.right) {
       points.push(
         <div 
           key="title-right"
           className="absolute rounded-full"
           style={{ 
             right: '-6px', 
             top: '22px',
             width: '12px',
             height: '12px',
             backgroundColor: 'rgba(0, 206, 69, 0.2)'
           }}
         >
           <div 
             className="absolute rounded-full"
             style={{
               left: '3px',
               top: '3px',
               width: '6px',
               height: '6px',
               backgroundColor: '#00CE45'
             }}
           />
         </div>
       );
     }
     
     // 内容区域的连接点 (蓝色和灰色)
     if (item.connectionPoints.content.left) {
       points.push(
         <div 
           key="content-left"
           className="absolute rounded-full"
           style={{ 
             left: '-6px', 
             top: '100px',
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
       );
     }
     if (item.connectionPoints.content.right) {
       points.push(
         <div 
           key="content-right"
           className="absolute rounded-full"
           style={{ 
             right: '-6px', 
             top: '100px',
             width: '12px',
             height: '12px',
             backgroundColor: 'rgba(28, 104, 255, 0.2)'
           }}
         >
           <div 
             className="absolute rounded-full"
             style={{
               left: '3px',
               top: '3px',
               width: '6px',
               height: '6px',
               backgroundColor: '#1C68FF'
             }}
           />
         </div>
       );
     }
     
     return points;
   };

  /**
   * 处理卡片点击事件
   */
  const handleCardClick = (e: React.MouseEvent) => {
    // 如果点击的是编辑或删除按钮，不触发卡片点击
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    if (onCardClick) {
      onCardClick(item.id);
    }
  };

  return (
      <Card 
          ref={setNodeRef}
          style={{
            ...style, 
            ...getCardStyle(),
            borderRadius: '12px'
          }}
          className={`group absolute cursor-move bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col border border-gray-300 ${
            isDragging ? 'shadow-lg scale-105 z-50' : 'transition-all duration-200'
          } ${
            isSelected ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={handleCardClick}
          {...listeners}
          {...attributes}
        >
      {/* 连接端点 */}
      {renderConnectionPoints()}
      
      {/* 内容区域 */}
         <div className="flex-1 px-3.5 py-3 gap-0.5" style={{ backgroundColor: '#FAFAFA', borderRadius: '12px 12px 12px 12px' }}>
           <div className="h-full overflow-hidden">
             <div className="text-xs text-gray-700 leading-relaxed prose prose-xs max-w-none">
               <ReactMarkdown
                 remarkPlugins={[remarkMath]}
                 rehypePlugins={[rehypeKatex]}
                 components={{
                   p: ({ children }) => <p className="mb-2 last:mb-0 text-xs leading-relaxed text-gray-850">{children}</p>,
                   h1: ({ children }) => <h1 className="text-xs font-medium mb-1 text-gray-950">{children}</h1>,
                   h2: ({ children }) => <h2 className="text-xs font-medium mb-1 text-gray-950">{children}</h2>,
                   h3: ({ children }) => <h3 className="text-xs font-medium mb-1 text-gray-950">{children}</h3>,
                   ul: ({ children }) => <ul className="list-disc list-inside mb-2 text-xs space-y-0.5">{children}</ul>,
                   ol: ({ children }) => <ol className="list-decimal list-inside mb-2 text-xs space-y-0.5">{children}</ol>,
                   li: ({ children }) => <li className="text-xs leading-relaxed text-gray-850">{children}</li>,
                   code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                   pre: ({ children }) => <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto font-mono border">{children}</pre>,
                   blockquote: ({ children }) => <blockquote className="border-l-2 border-gray-300 pl-2 italic text-gray-600 mb-2">{children}</blockquote>
                 }}
               >
                 {item.summary || item.content}
               </ReactMarkdown>
             </div>
           </div>
         </div>
      
      {/* 标题区域 */}
       <div className="bg-white border-t border-gray-300 px-4 py-1.5 relative" style={{ borderRadius: '0 0 12px 12px' }}>
         <div className="flex items-start justify-between">
           <div className="flex items-start space-x-2.5 flex-1">
             <div 
               className="w-1 h-5 rounded-full mt-0.5" 
               style={{ backgroundColor: item.color }}
             />
             <div className="flex-1">
               <h3 className="text-xs font-semibold text-gray-950 leading-tight mb-0.5">
                 {item.title}
               </h3>
               <span className="text-xs text-gray-600 font-medium">{formatTimestamp(item.createdAt)}</span>
             </div>
           </div>
           <div className="flex space-x-1 ml-2">
             <Button
               variant="ghost"
               size="sm"
               className="h-6 w-6 p-0 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
               onClick={(e) => {
                 e.stopPropagation();
                 onEdit(item);
               }}
             >
               <Edit3 className="w-3 h-3" />
             </Button>
             <Button
               variant="ghost"
               size="sm"
               className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
               onClick={(e) => {
                 e.stopPropagation();
                 onDelete(item.id);
               }}
             >
               <Trash2 className="w-3 h-3" />
             </Button>
           </div>
         </div>
       </div>
    </Card>
  );
}



/**
 * 可放置区域组件
 */
function DroppableCanvas({ 
  children
}: { 
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({
    id: 'canvas',
  });

  return (
    <div 
      ref={setNodeRef}
      className="relative w-full h-full"
    >
      {children}
    </div>
  );
}

/**
 * 底部控制栏组件
 */
function CanvasControls({ 
  scale, 
  onZoomIn, 
  onZoomOut, 
  onReset 
}: { 
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div 
        className="flex items-center space-x-2 px-4 py-2"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(9.6px)',
          borderRadius: '25px',
          border: '2px solid #D5D5D5'
        }}
      >
        {/* 缩小按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomOut}
          disabled={scale <= 0.1}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        
        {/* 缩放比例显示 */}
        <span className="text-sm text-gray-600 min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>
        
        {/* 放大按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomIn}
          disabled={scale >= 3}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        
        {/* 分隔线 */}
        <div className="w-px h-6 bg-gray-200 mx-2" />
        
        {/* 回中按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-8 w-8 p-0 hover:bg-gray-100"
          title="重置视图"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        
        {/* 平移提示 */}
        <div className="flex items-center space-x-1 text-xs text-gray-500 ml-2">
          <Move className="w-3 h-3" />
          <span>中键拖拽</span>
        </div>
      </div>
    </div>
  );
}

/**
 * 画板页面组件
 */
export default function CanvasPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const knowledgeBaseId = params.id as string;
  
  // 使用ref跟踪数据加载状态，防止重复请求
  const hasLoadedData = useRef(false);
  const currentKnowledgeBaseId = useRef<string | null>(null);
  
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [newItemType, setNewItemType] = useState<'text' | 'image' | 'link' | 'note'>('text');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>('component');
  const [activeId, setActiveId] = useState<string | null>(null);
  // 画布变换状态
  const [canvasTransform, setCanvasTransform] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0
  });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  // 框选功能状态
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // 历史记录状态（用于撤回功能）
  const [history, setHistory] = useState<KnowledgeBase[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [maxHistorySize] = useState(50); // 最大历史记录数量

  // 创建稳定的数据获取函数
  const fetchCanvasData = useCallback(async () => {
    if (!knowledgeBaseId || !user) return;
    
    // 检查是否已经为当前knowledgeBaseId加载过数据
    if (hasLoadedData.current && currentKnowledgeBaseId.current === knowledgeBaseId) {
      return;
    }
    
    // 标记开始加载，防止重复请求
    hasLoadedData.current = true;
    currentKnowledgeBaseId.current = knowledgeBaseId;
    
    try {
      console.log(`Fetching canvas data for ID: ${knowledgeBaseId}`);
      const cards = await pullCanvasState(parseInt(knowledgeBaseId), user.id);
      
      // 并行获取所有卡片的详细内容
      const itemsPromises = cards.map(async (card: RawCardResponse) => {
        let contentDetail: ContentDetail | null = null;
        
        // 根据content_id获取内容详情
        if (card.content_id) {
          try {
            contentDetail = await getContentById(card.content_id, user.id);
          } catch (error) {
            console.warn(`Failed to fetch content detail for content_id ${card.content_id}:`, error);
          }
        }
        
        return {
          id: card.id ? card.id.toString() : `card-${Date.now()}-${Math.random()}`,
          type: (contentDetail?.content_type === 'image' ? 'image' : 'text') as 'text' | 'image' | 'link' | 'note',
          title: contentDetail?.summary_title || `Card ${card.id || 'Unknown'}`,
          content: contentDetail?.text_data || contentDetail?.debug_info?.effective_content || card.summary || `Content for card ${card.id || 'Unknown'}`,
          summary: contentDetail?.summary_content || contentDetail?.text_data_preview || card.summary || `Summary for card ${card.id || 'Unknown'}`,
          position: { 
            x: card.position_x ?? 100 + Math.random() * 200, // 为null值提供默认位置
            y: card.position_y ?? 100 + Math.random() * 200
          },
          size: { width: 250, height: 150 },
          centerOffset: { x: 0, y: 0 },
          zIndex: 1,
          color: '#3B82F6',
          connectionPoints: {
            title: { left: true, right: true },
            content: { left: true, right: true },
          },
          createdAt: contentDetail?.created_at || new Date().toISOString(),
          updatedAt: contentDetail?.updated_at || new Date().toISOString(),
        };
      });
      
      const items = await Promise.all(itemsPromises);
      setKnowledgeBase({ id: knowledgeBaseId, title: 'Canvas', description: '', items });
      console.log(`Canvas data loaded successfully for ID: ${knowledgeBaseId}`);
    } catch (error) {
      console.error('Failed to fetch canvas state:', error);
      // 如果请求失败，重置加载状态以允许重试
      hasLoadedData.current = false;
      currentKnowledgeBaseId.current = null;
    }
  }, [knowledgeBaseId, user]);
  
  // 当knowledgeBaseId或user改变时，重置状态并获取数据
  useEffect(() => {
    if (currentKnowledgeBaseId.current !== knowledgeBaseId) {
      hasLoadedData.current = false;
      currentKnowledgeBaseId.current = null;
      setKnowledgeBase(null);
    }
    
    fetchCanvasData();
  }, [knowledgeBaseId, user, fetchCanvasData]);



  // 配置拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  /**
   * 添加新的知识项
   */
  const handleAddItem = (type: 'text' | 'image' | 'link' | 'note') => {
    if (!knowledgeBase) return;

    // 保存当前状态到历史记录
    saveToHistory(knowledgeBase);

    const newItem: KnowledgeItem = {
      id: Date.now().toString(),
      type,
      title: `新${type === 'text' ? '文本' : type === 'image' ? '图片' : type === 'link' ? '链接' : '便签'}`,
      content: '点击编辑内容...',
      summary: '## 新建内容\n\n这是一个新建的知识项，请编辑添加具体内容。',
      position: { x: Math.random() * 300 + 50, y: Math.random() * 200 + 50 },
      size: { width: 214, height: 292 },
      centerOffset: { x: Math.random() * 400 - 200, y: Math.random() * 300 - 150 },
      zIndex: Math.max(...knowledgeBase.items.map(item => item.zIndex), 0) + 1,
      color: type === 'text' ? '#3B82F6' : type === 'image' ? '#10B981' : type === 'link' ? '#8B5CF6' : '#F59E0B',
      connectionPoints: {
        title: { left: false, right: true },
        content: { left: false, right: true }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setKnowledgeBase({
      ...knowledgeBase,
      items: [...knowledgeBase.items, newItem]
    });
    setShowAddMenu(false);
  };

  /**
   * 编辑知识项
   */
  const handleEditItem = (item: KnowledgeItem) => {
    setEditingItem(item);
    setIsEditing(true);
  };

  /**
   * 保存编辑
   */
  const handleSaveEdit = (title: string, content: string) => {
    if (!knowledgeBase || !editingItem) return;

    // 保存当前状态到历史记录
    saveToHistory(knowledgeBase);

    const updatedItems = knowledgeBase.items.map(item => 
      item.id === editingItem.id 
        ? { ...item, title, content, updatedAt: new Date().toISOString() }
        : item
    );

    setKnowledgeBase({ ...knowledgeBase, items: updatedItems });
    setIsEditing(false);
    setEditingItem(null);
  };

  /**
   * 删除知识项
   */
  const handleDeleteItem = (id: string) => {
    if (!knowledgeBase) return;

    // 保存当前状态到历史记录
    saveToHistory(knowledgeBase);

    const updatedItems = knowledgeBase.items.filter(item => item.id !== id);
    setKnowledgeBase({ ...knowledgeBase, items: updatedItems });
  };

  /**
   * 处理卡片点击事件 - 进入编辑模式
   */
  const handleCardClick = (clickedItemId: string) => {
    if (!knowledgeBase) return;

    // 查找被点击的卡片
    const clickedItem = knowledgeBase.items.find(item => item.id === clickedItemId);
    if (!clickedItem) return;

    // 进入编辑模式
    handleEditItem(clickedItem);

    // 保存当前状态到历史记录
    saveToHistory(knowledgeBase);

    setKnowledgeBase(prev => {
      if (!prev) return prev;
      
      // 被点击的卡片层级设为最高
      const maxZIndex = Math.max(...prev.items.map(i => i.zIndex || 0), 0);
      
      return {
        ...prev,
        items: prev.items.map(item => {
          if (item.id === clickedItemId) {
            return { ...item, zIndex: maxZIndex + 1 };
          }
          return item;
        })
      };
    });
  };

  /**
   * 清除选中卡片的内容
   */
  const handleClearSelectedItems = () => {
    if (!knowledgeBase || selectedItems.length === 0) return;

    // 保存当前状态到历史记录
    saveToHistory(knowledgeBase);

    const updatedItems = knowledgeBase.items.map(item => 
      selectedItems.includes(item.id) 
        ? { ...item, content: '', updatedAt: new Date().toISOString() }
        : item
    );

    setKnowledgeBase({ ...knowledgeBase, items: updatedItems });
    setSelectedItems([]);
  };

  /**
   * 删除选中的卡片（从知识库中移除关联）
   */
  const handleDeleteSelectedItems = () => {
    if (!knowledgeBase || selectedItems.length === 0) return;

    // 保存当前状态到历史记录
    saveToHistory(knowledgeBase);

    const updatedItems = knowledgeBase.items.filter(item => !selectedItems.includes(item.id));
    setKnowledgeBase({ ...knowledgeBase, items: updatedItems });
    setSelectedItems([]);
  };

  /**
   * 保存当前状态到历史记录
   */
  const saveToHistory = (currentState: KnowledgeBase) => {
    if (!currentState) return;
    
    // 深拷贝当前状态
    const stateCopy = JSON.parse(JSON.stringify(currentState));
    
    setHistory(prevHistory => {
      // 如果当前不在历史记录的末尾，则删除后面的记录
      const newHistory = historyIndex >= 0 ? prevHistory.slice(0, historyIndex + 1) : [];
      
      // 添加新的状态
      newHistory.push(stateCopy);
      
      // 限制历史记录大小
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        setHistoryIndex(prev => Math.max(0, prev));
      } else {
        setHistoryIndex(newHistory.length - 1);
      }
      
      return newHistory;
    });
  };
  
  /**
   * 撤回操作
   */
  const handleUndo = () => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setKnowledgeBase(previousState);
      setHistoryIndex(historyIndex - 1);
      setSelectedItems([]); // 清除选择状态
    }
  };
  
  /**
   * 重做操作
   */
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setKnowledgeBase(nextState);
      setHistoryIndex(historyIndex + 1);
      setSelectedItems([]); // 清除选择状态
    }
  };

  /**
   * 检测选区内的卡片
   */
  const getItemsInSelection = (start: { x: number; y: number }, end: { x: number; y: number }): string[] => {
    if (!knowledgeBase) return [];
    
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);
    
    return knowledgeBase.items
      .filter(item => {
        const itemLeft = item.position.x;
        const itemRight = item.position.x + item.size.width;
        const itemTop = item.position.y;
        const itemBottom = item.position.y + item.size.height;
        
        // 检测矩形相交（有交集即选中）
        return !(itemRight < minX || itemLeft > maxX || itemBottom < minY || itemTop > maxY);
      })
      .map(item => item.id);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, delta, over } = event;
    setActiveId(null);

    if (!knowledgeBase || !user) return;

    let updatedItems = [...knowledgeBase.items];
    let isNewItem = false;

    // 从侧边栏拖拽新卡片
    if (active.id.toString().startsWith('template-') && over?.id === 'canvas') {
      const template = active.data.current?.template;
      if (!template) return;

      isNewItem = true;
      
      // 获取画布容器的边界矩形
      const canvasElement = document.querySelector('[data-canvas-container]') as HTMLElement;
      const canvasRect = canvasElement?.getBoundingClientRect();
      
      // 计算鼠标在画布坐标系中的位置
      const mouseEvent = event.activatorEvent as MouseEvent;
      const canvasX = canvasRect ? mouseEvent.clientX - canvasRect.left : mouseEvent.clientX;
      const canvasY = canvasRect ? mouseEvent.clientY - canvasRect.top : mouseEvent.clientY;
      
      // 转换为画布内部坐标（考虑缩放和平移）
      const worldX = (canvasX - canvasTransform.translateX) / canvasTransform.scale;
      const worldY = (canvasY - canvasTransform.translateY) / canvasTransform.scale;
      
      // 卡片尺寸
      const cardWidth = 214;
      const cardHeight = 292;
      
      const newItem: KnowledgeItem = {
        id: `item-${Date.now()}`,
        type: template.type,
        title: template.title,
        content: template.content,
        summary: template.content,
        position: { 
          x: worldX - cardWidth / 2,  // 使卡片中心对齐到鼠标位置
          y: worldY - cardHeight / 2
        },
        size: { width: cardWidth, height: cardHeight },
        centerOffset: { x: 0, y: 0 },
        zIndex: knowledgeBase.items.length + 1,
        color: template.color,
        connectionPoints: {
          title: { left: true, right: true },
          content: { left: true, right: true }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      updatedItems.push(newItem);
    } else if (delta.x !== 0 || delta.y !== 0) { // 移动现有卡片
      const itemIndex = updatedItems.findIndex(i => i.id === active.id);
      if (itemIndex === -1) return;

      const item = updatedItems[itemIndex];
      const newPosition = {
        x: item.position.x + delta.x,
        y: item.position.y + delta.y,
      };
      updatedItems[itemIndex] = { ...item, position: newPosition, updatedAt: new Date().toISOString() };
    } else {
      return; // 没有移动，直接返回
    }

    saveToHistory({ ...knowledgeBase, items: updatedItems });
    setKnowledgeBase({ ...knowledgeBase, items: updatedItems });

    try {
      const cardsToPush = updatedItems.map(i => {
        // 解析卡片ID，新卡片ID格式为item-timestamp，现有卡片ID为数字字符串
        let cardId = null;
        let contentId = null;
        
        if (i.id.startsWith('item-')) {
          // 新创建的卡片，ID为null（由后端分配）
          cardId = null;
          contentId = null;
        } else {
          // 现有卡片，尝试解析ID
          const parsedId = parseInt(i.id);
          if (!isNaN(parsedId)) {
            cardId = parsedId;
            contentId = parsedId; // FIXME: content_id应该从实际数据获取
          }
        }
        
        return {
          card_id: cardId,
          content_id: contentId,
          position: {
            x: typeof i.position?.x === 'number' ? i.position.x : null,
            y: typeof i.position?.y === 'number' ? i.position.y : null
          },
        };
      });
      await pushCanvasState(parseInt(knowledgeBaseId), cardsToPush, user.id);
    } catch (error) {
      console.error('Failed to push canvas state:', error);
      // 如果API调用失败，可以考虑回滚状态
      // setKnowledgeBase(history[historyIndex]);
    }
  };

  /**
   * 处理画布缩放
   */
  const handleCanvasZoom = (delta: number, centerX: number, centerY: number) => {
    setCanvasTransform(prev => {
      const newScale = Math.max(0.1, Math.min(3, prev.scale + delta));
      const scaleDiff = newScale - prev.scale;
      
      // 以鼠标位置为中心进行缩放
      const newTranslateX = prev.translateX - (centerX - prev.translateX) * scaleDiff / prev.scale;
      const newTranslateY = prev.translateY - (centerY - prev.translateY) * scaleDiff / prev.scale;
      
      return {
        scale: newScale,
        translateX: newTranslateX,
        translateY: newTranslateY
      };
    });
  };

  /**
   * 处理画布平移
   */
  const handleCanvasPan = (deltaX: number, deltaY: number) => {
    setCanvasTransform(prev => ({
      ...prev,
      translateX: prev.translateX + deltaX,
      translateY: prev.translateY + deltaY
    }));
  };

  /**
   * 重置画布到中心位置
   */
  const resetCanvasView = () => {
    setCanvasTransform({
      scale: 1,
      translateX: 0,
      translateY: 0
    });
  };

  /**
   * 处理鼠标滚轮事件
   */
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = e.clientX - rect.left;
    const centerY = e.clientY - rect.top;
    handleCanvasZoom(delta, centerX, centerY);
  };

  /**
   * 检测鼠标位置是否在任何卡片上
   */
  const isMouseOverCard = (mouseX: number, mouseY: number): boolean => {
    if (!knowledgeBase) return false;
    
    return knowledgeBase.items.some(item => {
      const itemLeft = item.position.x;
      const itemRight = item.position.x + item.size.width;
      const itemTop = item.position.y;
      const itemBottom = item.position.y + item.size.height;
      
      return mouseX >= itemLeft && mouseX <= itemRight && mouseY >= itemTop && mouseY <= itemBottom;
    });
  };

  /**
   * 处理鼠标按下事件（开始平移或框选）
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // 中键或Ctrl+左键
      e.preventDefault();
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    } else if (e.button === 0 && selectedTool === 'component') { // 左键且为鼠标工具
      const rect = e.currentTarget.getBoundingClientRect();
      const startX = (e.clientX - rect.left - canvasTransform.translateX) / canvasTransform.scale;
      const startY = (e.clientY - rect.top - canvasTransform.translateY) / canvasTransform.scale;
      
      // 检测鼠标是否在卡片上，如果在卡片上则不开启选择框
      if (!isMouseOverCard(startX, startY)) {
        e.preventDefault();
        setIsSelecting(true);
        setSelectionStart({ x: startX, y: startY });
        setSelectionEnd({ x: startX, y: startY });
        setSelectedItems([]); // 清除之前的选择
      }
    }
  };

  /**
   * 处理鼠标移动事件（平移中或框选中）
   */
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      handleCanvasPan(deltaX, deltaY);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    } else if (isSelecting) {
      const rect = e.currentTarget.getBoundingClientRect();
      const endX = (e.clientX - rect.left - canvasTransform.translateX) / canvasTransform.scale;
      const endY = (e.clientY - rect.top - canvasTransform.translateY) / canvasTransform.scale;
      
      setSelectionEnd({ x: endX, y: endY });
      
      // 实时检测选中的卡片
      if (knowledgeBase) {
        const selectedIds = getItemsInSelection(selectionStart, { x: endX, y: endY });
        setSelectedItems(selectedIds);
      }
    }
  };

  /**
   * 处理鼠标抬起事件（结束平移或框选）
   */
  const handleMouseUp = () => {
    setIsPanning(false);
    setIsSelecting(false);
  };

  /**
   * 处理工具栏点击事件
   */
  const handleToolbarClick = (toolId: string) => {
    setSelectedTool(toolId);
    console.log('选中工具:', toolId);
    // 这里可以根据不同的工具执行不同的操作
    switch (toolId) {
      case 'component':
        // 组件工具逻辑
        break;
      case 'connection':
        // 连接工具逻辑
        break;
      case 'pencil':
        // 铅笔工具逻辑
        break;
      case 'search':
        // 搜索工具逻辑
        break;
      case 'bookmark':
        // 书签工具逻辑
        break;
      default:
        break;
    }
  };

  if (!knowledgeBase) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 左上角知识库标题模块 */}
      <div className="fixed top-4 left-4 z-50">
        <div 
          className="px-4 py-2" 
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(9.6px)',
            borderRadius: '25px',
            border: '2px solid #D5D5D5'
          }}
        >
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-800">
              {knowledgeBase?.title || 'Canvas'}
            </h1>
          </div>
        </div>
      </div>
      
      {/* 画板区域 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="relative w-full h-screen">
          <div 
            className="relative w-full h-full overflow-hidden bg-gray-50"
            data-canvas-container
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ 
              cursor: isPanning ? 'grabbing' : 'default',
              ...(() => {
                const dotSize = 67;
                const scaledDotSize = dotSize * canvasTransform.scale;
                return {
                  backgroundImage: `url('/patterns/dot-grid.svg')`,
                  backgroundSize: `${scaledDotSize}px ${scaledDotSize}px`,
                  backgroundPosition: `${canvasTransform.translateX % scaledDotSize}px ${canvasTransform.translateY % scaledDotSize}px`,
                  backgroundRepeat: 'repeat'
                };
              })()
            }}
          >
            <div
              style={{
                transform: `translate(${canvasTransform.translateX}px, ${canvasTransform.translateY}px) scale(${canvasTransform.scale})`,
                transformOrigin: '0 0',
                width: '100%',
                height: '100%',
                position: 'relative'
              }}
            >
              <DroppableCanvas>
                {knowledgeBase.items.map((item) => (
                  <DraggableKnowledgeItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                    onCardClick={handleCardClick}
                    isSelected={selectedItems.includes(item.id)}
                  />
                ))}
                
                {/* 选区框 */}
                {isSelecting && (
                  <div
                    style={{
                      position: 'absolute',
                      left: Math.min(selectionStart.x, selectionEnd.x),
                      top: Math.min(selectionStart.y, selectionEnd.y),
                      width: Math.abs(selectionEnd.x - selectionStart.x),
                      height: Math.abs(selectionEnd.y - selectionStart.y),
                      border: '2px dashed #1C68FF',
                      backgroundColor: 'rgba(28, 104, 255, 0.1)',
                      pointerEvents: 'none',
                      zIndex: 999,
                    }}
                  />
                )}
              </DroppableCanvas>
            </div>
          </div>
          
          {/* 工具栏 */}
        <Toolbar onItemClick={handleToolbarClick} activeItem={selectedTool} />
        
        {/* 右侧边栏 */}
        <CanvasSidebar />
          
          {/* 底部控制栏 */}
          <CanvasControls
            scale={canvasTransform.scale}
            onZoomIn={() => handleCanvasZoom(0.1, window.innerWidth / 2, window.innerHeight / 2)}
            onZoomOut={() => handleCanvasZoom(-0.1, window.innerWidth / 2, window.innerHeight / 2)}
            onReset={resetCanvasView}
          />
        </div>

      </DndContext>

      {/* 编辑模态框 */}
      {isEditing && editingItem && (
        <EditModal
          item={editingItem}
          onSave={handleSaveEdit}
          onCancel={() => {
            setIsEditing(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

/**
 * 编辑模态框组件
 */
function EditModal({ 
  item, 
  onSave, 
  onCancel 
}: { 
  item: KnowledgeItem;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [content, setContent] = useState(item.content);
  const { dialogPositioning } = useHeaderAwarePositioning();

  const handleSave = () => {
    onSave(title, content);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4 overflow-y-auto"
        style={{
          maxHeight: dialogPositioning.maxHeight,
          marginTop: '1rem',
          marginBottom: '1rem'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">编辑内容</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              标题
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入标题"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              内容
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="输入内容"
              rows={4}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        </div>
      </div>
    </div>
  );
}