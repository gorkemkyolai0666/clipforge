'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('demo@clipforge.com.tr');
  const [password, setPassword] = useState('demo123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forge-hero flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md border-border/80 bg-card/95 backdrop-blur">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-coral text-primary-foreground"><Layers className="h-5 w-5" /></div>
            <span className="font-display text-lg font-extrabold">ClipForge</span>
          </div>
          <CardTitle className="font-display text-2xl">Panele Giriş</CardTitle>
          <p className="text-sm text-muted-foreground">Proje yönetim panelinize erişin</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label htmlFor="email">E-posta</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div><Label htmlFor="password">Şifre</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}</Button>
          </form>
          <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <p className="font-mono">Demo: demo@clipforge.com.tr / demo123456</p>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Hesabınız yok mu? <Link href="/register" className="font-medium text-coral-light hover:underline">Dosya Sürümü olun</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
