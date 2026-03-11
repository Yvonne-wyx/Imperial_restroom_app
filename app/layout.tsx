import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/Components/Header';
import BottomNav from '@/Components/BottomNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Imperial Washroom App',
  description: 'Smart campus washroom locator and status',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 添加 suppressHydrationWarning 来修复浏览器扩展引起的报错
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <Header />
        
        {/* max-w-md mx-auto 强制把网页限制在手机屏幕宽度居中显示 */}
        <main className="pt-14 pb-16 min-h-screen max-w-md mx-auto bg-gray-50 shadow-sm relative overflow-x-hidden">
          {children}
        </main>

        <BottomNav />
      </body>
    </html>
  );
}
