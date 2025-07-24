import { Camera, FileText, Mic } from 'lucide-react';
import type { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Home | CogniBlock',
  description: 'Welcome to CogniBlock. Capture your world by uploading photos, text, or voice notes.',
};

function UploadOptionCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="group cursor-pointer overflow-hidden text-center transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 hover:border-accent/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <div className="rounded-full bg-accent/10 p-5 transition-colors duration-300 group-hover:bg-accent/20">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <p className="mt-1 text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-4">
      <div className="absolute inset-0 z-0 opacity-50">
        <div className="absolute bottom-0 left-[-20%] right-[-20%] top-[-20%] h-[140%] w-[140%] bg-[radial-gradient(at_50%_50%,hsl(var(--primary))_0%,transparent_50%)]"></div>
        <div className="absolute bottom-0 right-[-10%] top-[-10%] h-[120%] w-[120%] bg-[radial-gradient(at_50%_50%,hsl(var(--accent))_0%,transparent_50%)]"></div>
      </div>
      <div className="container z-10 mx-auto flex max-w-5xl flex-col items-center justify-center py-16 text-center">
        <h1 className="font-headline text-5xl font-extrabold tracking-tight text-foreground drop-shadow-lg sm:text-6xl md:text-7xl">
          CogniBlock
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Capture your world. Upload photos, text, or voice notes seamlessly.
        </p>
        <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          <UploadOptionCard
            icon={<Camera className="size-12 text-accent" />}
            title="Photo Upload"
            description="Snap or select a picture"
          />
          <UploadOptionCard
            icon={<FileText className="size-12 text-accent" />}
            title="Text Upload"
            description="Paste or type your thoughts"
          />
          <UploadOptionCard
            icon={<Mic className="size-12 text-accent" />}
            title="Voice Upload"
            description="Record a quick audio note"
          />
        </div>
      </div>
    </main>
  );
}
