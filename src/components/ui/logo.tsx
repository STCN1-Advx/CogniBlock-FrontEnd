import React from 'react';
import Image from 'next/image';

/**
 * Logo 组件 - 固定在页面左上角的品牌标识
 * 使用 1:2 横向比例的 PNG logo
 */
export function Logo() {
  return (
    <div className="fixed top-4 left-4 z-50">
      <div className="w-50 h-25 sm:w-60 sm:h-30">
        <Image
          src="/logo.png"
          alt="CogniBlock Logo"
          width={240}
          height={120}
          className="w-full h-full object-contain"
          priority
        />
      </div>
    </div>
  );
}