import type { Metadata } from 'next';
import { Sora } from 'next/font/google';
import { JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { ToastProvider } from '@/lib/toast-context';
import './globals.css';

const bodyFont = Sora({
  subsets: ["latin", "latin-ext"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const monoFont = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "ClipForge — Yapay Zeka Destekli Klip Yönetimi",
  description: "İzleyici drop-off inbox, sahne bölüm blast radius ısı haritası ve embed cascade radarı — Loom kalitesinde Türkçe SaaS.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="dark" suppressHydrationWarning>
            <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${bodyFont.variable} ${monoFont.variable} font-sans`}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
