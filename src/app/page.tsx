'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * 主页组件
 * CogniBlock 应用的欢迎页面
 */
export default function HomePage() {

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">欢迎使用 CogniBlock</CardTitle>
          <CardDescription>
            智能知识管理平台
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600">
            请使用右上角的登录按钮开始使用
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
