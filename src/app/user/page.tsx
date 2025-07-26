'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Calendar, FileText } from 'lucide-react';

// 知识库数据类型定义
interface KnowledgeBase {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  itemCount: number;
  lastModified: string;
  color: string;
}

/**
 * 知识库卡片组件
 * 展示单个知识库的信息
 */
function KnowledgeBaseCard({ knowledgeBase }: { knowledgeBase: KnowledgeBase }) {
  return (
    <Link href={`/canvas/${knowledgeBase.id}`} className="block">
      <Card className="group cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 active:scale-95 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: knowledgeBase.color }}
              />
              <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {knowledgeBase.title}
              </CardTitle>
            </div>
            <BookOpen className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <CardDescription className="text-sm text-gray-600 line-clamp-2">
            {knowledgeBase.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <FileText className="w-3 h-3" />
                <span>{knowledgeBase.itemCount} 项内容</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{knowledgeBase.lastModified}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * 用户页面组件
 * 展示用户的知识库列表
 */
export default function UserPage() {
  // 模拟知识库数据
  const [knowledgeBases] = useState<KnowledgeBase[]>([
    {
      id: '1',
      title: '工作笔记',
      description: '记录日常工作中的重要信息、会议纪要和项目进展',
      createdAt: '2024-01-15',
      itemCount: 24,
      lastModified: '2天前',
      color: '#3B82F6'
    },
    {
      id: '2',
      title: '学习资料',
      description: '收集的技术文档、教程和学习心得',
      createdAt: '2024-01-10',
      itemCount: 18,
      lastModified: '1周前',
      color: '#10B981'
    },
    {
      id: '3',
      title: '项目灵感',
      description: '创意想法、设计草图和产品概念的收集',
      createdAt: '2024-01-08',
      itemCount: 12,
      lastModified: '3天前',
      color: '#F59E0B'
    },
    {
      id: '4',
      title: '生活记录',
      description: '日常生活的点点滴滴、旅行照片和美食记录',
      createdAt: '2024-01-05',
      itemCount: 31,
      lastModified: '1天前',
      color: '#EF4444'
    },
    {
      id: '5',
      title: '读书笔记',
      description: '阅读过程中的思考、摘录和书评',
      createdAt: '2024-01-01',
      itemCount: 8,
      lastModified: '5天前',
      color: '#8B5CF6'
    },
    {
      id: '6',
      title: '健康管理',
      description: '运动记录、饮食计划和健康数据追踪',
      createdAt: '2023-12-28',
      itemCount: 15,
      lastModified: '1周前',
      color: '#06B6D4'
    }
  ]);

  /**
   * 处理创建新知识库
   */
  const handleCreateNew = () => {
    // 跳转到添加知识库页面
    window.location.href = '/add-knowledge';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* 页面标题和操作区域 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">我的知识库</h1>
            <p className="text-gray-600">管理和浏览您的所有知识收藏</p>
          </div>
          <Button 
            onClick={handleCreateNew}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            新建知识库
          </Button>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总知识库</p>
                  <p className="text-2xl font-bold text-gray-900">{knowledgeBases.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总内容数</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {knowledgeBases.reduce((sum, kb) => sum + kb.itemCount, 0)}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">最近更新</p>
                  <p className="text-2xl font-bold text-gray-900">1天前</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 知识库网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {knowledgeBases.map((kb) => (
            <KnowledgeBaseCard key={kb.id} knowledgeBase={kb} />
          ))}
        </div>

        {/* 空状态提示（当没有知识库时显示） */}
        {knowledgeBases.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">还没有知识库</h3>
            <p className="text-gray-500 mb-6">创建您的第一个知识库来开始收集和整理信息</p>
            <Button 
              onClick={handleCreateNew}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建第一个知识库
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}