'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Loader2, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

// Mock API functions based on the documentation
const API_BASE_URL = 'http://127.0.0.1:8000';

async function uploadImage(file: File): Promise<{ ticket_id: string }> {
  const formData = new FormData();
  formData.append('file', file);
  // Using a mock API for demonstration. Replace with your actual API endpoint.
  // const response = await fetch(`${API_BASE_URL}/process/new`, {
  //   method: 'POST',
  //   body: formData,
  // });
  // if (!response.ok) {
  //   throw new Error('Image upload failed');
  // }
  // return response.json();

  // Mock response
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { ticket_id: `mock_ticket_${Date.now()}` };
}

async function checkStatus(ticketId: string): Promise<{ state: number; description: string }> {
  // Mock response
  const states = [
    { state: 1, description: 'In queue' },
    { state: 2, description: 'Processing' },
    { state: 3, description: 'Analyzing with AI' },
    { state: 4, description: 'Done' },
  ];
  
  const currentState = states[Math.floor(Math.random() * states.length)];
  
  if (checkStatus.attempts === undefined) {
    checkStatus.attempts = 0;
  }
  checkStatus.attempts++;

  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (checkStatus.attempts >= 3) {
      checkStatus.attempts = 0;
      return { state: 4, description: 'Done' };
  }

  return { state: Math.min(checkStatus.attempts, 3), description: `Step ${checkStatus.attempts} of 3` };
}
checkStatus.attempts = 0;


async function getResult(ticketId: string, format: 'markdown' | 'html' = 'markdown'): Promise<string> {
  // Mock response
  await new Promise(resolve => setTimeout(resolve, 500));
  return `# Your Note\n\nThis is a processed note from your image. It contains the extracted text in ${format} format.\n\n- Point 1\n- Point 2\n- Point 3`;
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
    setProgressDescription('Uploading image...');

    try {
      const { ticket_id } = await uploadImage(selectedImage);
      setProgress(25);
      
      setStatus('processing');
      setProgressDescription('Image uploaded. Waiting for processing to start...');

      let taskDone = false;
      while (!taskDone) {
        const statusResult = await checkStatus(ticket_id);
        
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
            case 4:
                taskDone = true;
                break;
        }

        setProgressDescription(statusResult.description);

        if (statusResult.state === 4) {
          taskDone = true;
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Poll every 2 seconds
        }
      }

      setProgressDescription('Fetching result...');
      const textResult = await getResult(ticket_id);
      setResult(textResult);
      setProgress(100);
      setStatus('success');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
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
    <main className="relative flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-6 md:p-10">
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute bottom-0 left-[-20%] right-[-20%] top-[-20%] h-[140%] w-[140%] bg-[radial-gradient(at_50%_50%,hsl(var(--primary))_0%,transparent_50%)]"></div>
        <div className="absolute bottom-0 right-[-10%] top-[-10%] h-[120%] w-[120%] bg-[radial-gradient(at_50%_50%,hsl(var(--accent))_0%,transparent_50%)]"></div>
      </div>
      <div className="container z-10 mx-auto flex max-w-4xl flex-col items-center justify-center py-16 text-center">
        <h1 className="font-headline text-5xl font-extrabold tracking-tight text-foreground drop-shadow-lg sm:text-6xl md:text-7xl">
          Upload Your Note
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Select a photo of your handwritten or printed notes to get started.
        </p>

        <Card className="mt-12 w-full max-w-2xl bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Camera /> Photo Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            {!selectedImage ? (
              <div
                className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/50 bg-muted/20 transition-colors hover:bg-muted/40"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mb-4 size-16 text-muted-foreground" />
                <p className="text-lg font-semibold text-foreground">Click to upload an image</p>
                <p className="text-sm text-muted-foreground">PNG, JPG, or GIF up to 10MB</p>
              </div>
            ) : (
                <div className="relative">
                    <img src={previewUrl!} alt="Preview" className="w-full h-auto max-h-96 rounded-lg object-contain" />
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 rounded-full h-8 w-8" onClick={handleRemoveImage}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {status !== 'idle' && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground">{progressDescription}</p>
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
              className="w-full"
              size="lg"
            >
              {(status === 'uploading' || status === 'processing') && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {status === 'idle' && 'Process Image'}
              {status === 'uploading' && 'Uploading...'}
              {status === 'processing' && 'Processing...'}
              {status === 'success' && 'Done!'}
              {status === 'error' && 'Try Again'}
            </Button>

            {result && status === 'success' && (
              <div className="text-left">
                <h3 className="flex items-center gap-2 text-2xl font-bold mb-4">
                  <FileText /> Your Processed Note
                </h3>
                <Textarea value={result} readOnly rows={15} className="bg-muted/20" />
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </main>
  );
}
