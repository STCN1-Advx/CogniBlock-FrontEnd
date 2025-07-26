'use client';

import React from 'react';

/**
 * 主页组件
 * CogniBlock 应用的欢迎页面
 */
export default function HomePage() {

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">欢迎使用 CogniBlock</h1>
        <p className="text-muted-foreground mb-4">
          重构你的知识管理体系
        </p>
        <p className="text-gray-600">
          请使用右上角的登录按钮开始使用
        </p>
      </div>
    </div>
  );
}
