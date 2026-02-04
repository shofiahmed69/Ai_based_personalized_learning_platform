import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { Providers } from './Providers';
import { HydrationBoundary } from './HydrationBoundary';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Knowledge Base',
  description: 'Personal AI knowledge base',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gray-950 text-gray-100 antialiased">
        <Providers>
          <HydrationBoundary>{children}</HydrationBoundary>
          <Toaster theme="dark" position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
