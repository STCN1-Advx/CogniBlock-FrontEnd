'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Loader2, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';

// 移除 @gradio/client 依赖，使用原生 fetch API

// 图片识别API配置 - 从环境变量读取
const API_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_API_BASE_URL || 'http://115.231.176.127:7860';

/**
 * 上传图片到识别API
 * @param file 要上传的图片文件
 * @returns 包含ticket_id的响应对象
 */
async function uploadImage(file: File): Promise<{ ticket_id: string }> {
  try {
    const formData = new FormData();
    formData.append('data', JSON.stringify([file, null]));
    
    const response = await apiClient(`${API_BASE_URL}/api/upload_image`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // 根据API文档，返回的是一个包含8个元素的数组
    // 第2个元素（索引1）是识别任务列表，第3个元素（索引2）是选择识别条目
    const resultData = result.data;
    const taskList = resultData[1];
    const selectedItem = resultData[2];
    
    // 从任务列表中提取ticket_id
    if (taskList && taskList.data && taskList.data.length > 0) {
      const latestTask = taskList.data[taskList.data.length - 1];
      return { ticket_id: latestTask[0] }; // 第一列是ticket_id
    }
    
    // 如果没有从任务列表获取到，尝试从选择条目获取
    if (selectedItem) {
      return { ticket_id: selectedItem };
    }
    
    throw new Error('无法获取任务ID');
  } catch (error) {
    console.error('上传图片失败:', error);
    throw new Error('图片上传失败');
  }
}

/**
 * 检查处理状态
 * @param ticketId 任务票据ID
 * @returns 包含状态码和描述的对象
 */
async function checkStatus(ticketId: string): Promise<{ state: number; description: string }> {
  try {
    const formData = new FormData();
    formData.append('data', JSON.stringify([
      ticketId,
      {"headers":["ticket_id","state","description"],"data":[],"metadata":null}
    ]));
    
    const response = await apiClient(`${API_BASE_URL}/api/refresh_selected_cb`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // 根据API文档，返回的是一个包含7个元素的数组
    // 第1个元素（索引0）是识别任务列表
    const resultData = result.data;
    const taskList = resultData[0];
    
    if (taskList && taskList.data && taskList.data.length > 0) {
      // 查找对应的ticket_id
      const task = taskList.data.find((row: any[]) => row[0] === ticketId);
      if (task) {
        return {
          state: parseInt(task[1]) || 1, // 第二列是状态
          description: task[2] || '处理中' // 第三列是描述
        };
      }
    }
    
    // 如果没有找到对应任务，返回默认状态
    return { state: 1, description: '任务队列中' };
  } catch (error) {
    console.error('状态检查失败:', error);
    throw new Error('状态检查失败');
  }
}


/**
 * 获取处理结果
 * @param ticketId 任务票据ID
 * @param format 返回格式，默认为markdown
 * @returns 处理后的文本内容
 */
async function getResult(ticketId: string, format: 'markdown' | 'html' = 'markdown'): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('data', JSON.stringify([ticketId]));
    
    const response = await apiClient(`${API_BASE_URL}/api/lambda`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // 根据API文档，返回的是一个包含5个元素的数组
    // 第5个元素（索引4）是处理结果文本
    const resultData = result.data;
    const resultText = resultData[4];
    
    if (resultText && typeof resultText === 'string') {
      return resultText;
    }
    
    throw new Error('无法获取处理结果');
  } catch (error) {
    console.error('获取结果失败:', error);
    throw new Error('获取结果失败');
  }
}


export default function PhotoUploadPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressDescription, setProgressDescription] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [selectedImage]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      resetState();
    }
  };

  const handleProcessClick = async () => {
    if (!selectedImage) return;

    setStatus('uploading');
    setError(null);
    setProgress(0);
    setProgressDescription('正在上传图片...');

    try {
      const { ticket_id } = await uploadImage(selectedImage);
      setProgress(25);
      
      setStatus('processing');
      setProgressDescription('图片上传完成，等待处理开始...');

      let taskDone = false;
      while (!taskDone) {
        const statusResult = await checkStatus(ticket_id);
        
        // 根据Gradio API的特点，我们需要检查任务是否完成
        // 如果状态描述包含"完成"或"Done"，或者状态为4，则认为任务完成
        const isCompleted = statusResult.state >= 4 || 
                           statusResult.description.includes('完成') || 
                           statusResult.description.includes('Done') ||
                           statusResult.description.includes('已完成');
        
        if (isCompleted) {
          setProgress(100);
          taskDone = true;
        } else {
          // 根据状态设置进度
          switch (statusResult.state) {
            case 1:
              setProgress(35);
              break;
            case 2:
              setProgress(60);
              break;
            case 3:
              setProgress(85);
              break;
            default:
              setProgress(Math.min(50 + statusResult.state * 10, 90));
          }
          
          setProgressDescription(statusResult.description);
          await new Promise(resolve => setTimeout(resolve, 3000)); // Poll every 3 seconds
        }
      }

      setProgressDescription('正在获取结果...');
      const textResult = await getResult(ticket_id);
      setResult(textResult);
      setProgress(100);
      setStatus('success');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发生未知错误';
      setError(errorMessage);
      setStatus('error');
    }
  };
  
  const resetState = () => {
      setStatus('idle');
      setProgress(0);
      setProgressDescription('');
      setResult(null);
      setError(null);
  }

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    resetState();
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }


  return (
    <main className="relative flex min-h-screen w-full flex-col items-center px-4 py-6 sm:p-6 md:p-10">
      <div className="container mx-auto flex max-w-4xl flex-col items-center justify-center py-8 sm:py-16 text-center">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl" style={{ color: '#333333' }}>
          Upload Your Note
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed sm:text-lg md:text-xl px-2" style={{ color: '#666666' }}>
          Select a photo of your handwritten or printed notes to get started.
        </p>

        <Card className="mt-8 sm:mt-12 w-full max-w-2xl backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl" style={{ color: '#333333' }}>
              <Camera className="size-5 sm:size-6" /> Photo Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            {!selectedImage ? (
              <div
                className="flex h-48 sm:h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 active:scale-[0.98] hover:bg-opacity-50" style={{ borderColor: '#66ccff', backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mb-3 sm:mb-4 size-12 sm:size-16" style={{ color: '#66ccff' }} />
                <p className="text-base sm:text-lg font-semibold px-4 text-center" style={{ color: '#333333' }}>Tap to upload an image</p>
                <p className="text-xs sm:text-sm mt-1 px-4 text-center" style={{ color: '#666666' }}>PNG, JPG, or GIF up to 10MB</p>
              </div>
            ) : (
                <div className="relative">
                    <img src={previewUrl!} alt="Preview" className="w-full h-auto max-h-80 sm:max-h-96 rounded-lg object-contain" />
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 rounded-full h-8 w-8 sm:h-10 sm:w-10 shadow-lg" onClick={handleRemoveImage}>
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                </div>
            )}

            {status !== 'idle' && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm" style={{ color: '#666666' }}>{progressDescription}</p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleProcessClick}
              disabled={!selectedImage || status === 'uploading' || status === 'processing'}
              className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold"
              size="lg"
            >
              {(status === 'uploading' || status === 'processing') && <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />}
              {status === 'idle' && 'Process Image'}
              {status === 'uploading' && 'Uploading...'}
              {status === 'processing' && 'Processing...'}
              {status === 'success' && 'Done!'}
              {status === 'error' && 'Try Again'}
            </Button>

            {result && status === 'success' && (
              <div className="text-left">
                <h3 className="flex items-center gap-2 text-xl sm:text-2xl font-bold mb-3 sm:mb-4" style={{ color: '#333333' }}>
                  <FileText className="size-5 sm:size-6" /> Your Processed Note
                </h3>
                <Textarea 
                  value={result} 
                  readOnly 
                  rows={12} 
                  className="text-sm sm:text-base leading-relaxed resize-none" 
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }} 
                />
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </main>
  );
}
