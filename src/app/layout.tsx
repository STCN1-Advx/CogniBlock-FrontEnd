import type {Metadata} from 'next';
import './globals.css';
import { GlobalBackground } from '@/components/ui/global-background';
import { ConditionalHeader, ConditionalWrapper } from '@/components/ui/conditional-header';
import { AuthGuard } from '@/components/auth-guard';
import { UserProvider } from '@/contexts/user-context';

export const metadata: Metadata = {
  title: 'CogniBlock',
  description: 'Capture your world. Upload photos, text, or voice notes seamlessly.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#66ccff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      </head>
      <body className="font-body antialiased">
        <UserProvider>
          <AuthGuard>
            <ConditionalHeader />
            <GlobalBackground>
              <ConditionalWrapper>
                {children}
              </ConditionalWrapper>
            </GlobalBackground>
          </AuthGuard>
        </UserProvider>
      </body>
    </html>
  );
}
