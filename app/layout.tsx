import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { Navigation } from '@/components/navigation';
import { SupabaseErrorBoundary } from '@/components/supabase-error';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lead Tracker - Deduplication & Campaign Management',
  description: 'Powerful lead deduplication and campaign tracking tool',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseErrorBoundary>
          <Navigation />
          <main className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
            {children}
          </main>
          <Toaster />
        </SupabaseErrorBoundary>
      </body>
    </html>
  );
}
