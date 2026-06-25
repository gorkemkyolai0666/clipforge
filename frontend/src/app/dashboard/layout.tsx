'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLoadingScreen } from '@/components/states';
import { useAuth } from '@/lib/auth-context';

/** Stitch HTML screens include full viewport layout (sidebar + content). */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading, router]);
  if (loading || !user) return <AuthLoadingScreen />;
  return <>{children}</>;
}
