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

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register({ name, email, password, organizationName });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dosya Sürümü başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forge-hero flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md border-border/80 bg-card/95 backdrop-blur">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-coral text-primary-foreground"><Layers className="h-5 w-5" /></div>
            <span className="font-display text-lg font-extrabold">ClipForge</span>
          </div>
          <CardTitle className="font-display text-2xl">Hesap Oluştur</CardTitle>
          <p className="text-sm text-muted-foreground">14 gün ücretsiz deneme ile başlayın</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label htmlFor="name">Ad Soyad</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div><Label htmlFor="org">Organizasyon Adı</Label><Input id="org" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} placeholder="Örn: Acme Yazılım" required /></div>
            <div><Label htmlFor="email">E-posta</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div><Label htmlFor="password">Şifre</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required /></div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Dosya Sürümü yapılıyor...' : 'Dosya Sürümü Ol'}</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Zaten hesabınız var mı? <Link href="/login" className="font-medium text-coral-light hover:underline">Giriş yapın</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
