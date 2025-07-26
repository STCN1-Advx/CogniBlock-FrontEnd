import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './button';

/**
 * Header 组件 - 页面顶部导航栏
 * 左侧显示Logo，右侧显示登录和注册按钮
 */
export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* 左侧Logo */}
        <Link href="/" className="flex items-center">
          <div className="w-16 h-8 sm:w-20 sm:h-10">
            <Image
              src="/logo.png"
              alt="CogniBlock Logo"
              width={160}
              height={80}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </Link>

        {/* 右侧按钮组 */}
        <div className="flex items-center space-x-4">
          <Link href="/user">
            <Button variant="ghost" size="sm" className="text-gray-700 hover:bg-gray-100">
              我的知识库
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm" className="text-gray-700 border-gray-300 hover:bg-gray-50">
              登录
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              注册
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}