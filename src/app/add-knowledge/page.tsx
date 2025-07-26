import { Camera, FileText, Mic } from 'lucide-react';
import type { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Add Knowledge | CogniBlock',
  description: 'Add new knowledge to your CogniBlock. Upload photos, text, or voice notes.',
};

/**
 * 上传选项卡片组件
 * 用于显示不同的上传方式选项
 */
function UploadOptionCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="group cursor-pointer overflow-hidden text-center transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 active:scale-95 backdrop-blur-sm h-full min-h-[160px] sm:min-h-[180px]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: '#66ccff' }}>
        <CardContent className="flex h-full flex-col items-center justify-center gap-3 sm:gap-4 p-6 sm:p-8">
          <div className="rounded-full p-4 sm:p-5 transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: 'rgba(102, 204, 255, 0.1)' }}>
            {icon}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-bold leading-tight" style={{ color: '#333333' }}>{title}</h3>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#666666' }}>{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * 添加知识库页面组件
 * 提供多种方式添加知识内容
 */
export default function AddKnowledgePage() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-8">
      <div className="container mx-auto flex flex-col items-center justify-center py-8 sm:py-16 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6" style={{ color: '#333333' }}>
          添加知识库
        </h1>
        <p className="max-w-2xl text-base leading-relaxed sm:text-lg md:text-xl px-4" style={{ color: '#666666' }}>
          选择您喜欢的方式来添加新的知识内容。支持图片、文本或语音笔记。
        </p>
        <div className="mt-8 sm:mt-12 grid w-full max-w-4xl grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3 px-2">
          <UploadOptionCard
            icon={<Camera className="size-10 sm:size-12" style={{ color: '#66ccff' }} />}
            title="图片上传"
            description="拍摄或选择一张图片"
            href="/photo"
          />
          <UploadOptionCard
            icon={<FileText className="size-10 sm:size-12" style={{ color: '#66ccff' }} />}
            title="文本上传"
            description="粘贴或输入您的想法"
            href="#"
          />
          <UploadOptionCard
            icon={<Mic className="size-10 sm:size-12" style={{ color: '#66ccff' }} />}
            title="语音上传"
            description="录制一段语音笔记"
            href="#"
          />
        </div>
      </div>
    </main>
  );
}