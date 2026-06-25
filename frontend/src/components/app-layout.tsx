'use client';
import { SidebarNav } from '@/components/sidebar-nav';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return <SidebarNav>{children}</SidebarNav>;
}
