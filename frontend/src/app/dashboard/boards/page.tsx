'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Kanban } from 'lucide-react';
import { LoadingSpinner, EmptyState } from '@/components/states';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatDate, unwrapList } from '@/lib/utils';

interface Board {
  id: string;
  name: string;
  description?: string;
  issueCount: number;
  updatedAt: string;
}

const demoBoards: Board[] = [
  { id: '1', name: 'Dosya Sürümü Geliştirme', description: 'Ana dosya sürümü backlog ve sprint klipsı', issueCount: 24, updatedAt: new Date().toISOString() },
  { id: '2', name: 'Altyapı & DevOps', description: 'CI/CD ve altyapı görevleri', issueCount: 11, updatedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', name: 'Tasarım Sistemi', description: 'UI bileşenleri ve tasarım tokenları', issueCount: 8, updatedAt: new Date(Date.now() - 172800000).toISOString() },
];

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);

  useEffect(() => {
    api.boards.list()
      .then((r) => { setBoards(unwrapList(r) as Board[]); setUsingDemo(false); })
      .catch(() => { setBoards(demoBoards); setUsingDemo(true); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Kliplar</h1>
          <p className="text-muted-foreground">Kanban kliplarınızı yönetin</p>
        </div>
        <div className="flex items-center gap-3">
          {usingDemo && <Badge variant="warning">Demo veri</Badge>}
          <Button><Plus className="mr-2 h-4 w-4" />Yeni Klip</Button>
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {!loading && boards.length === 0 && (
        <EmptyState title="Henüz klip yok" description="İlk kanban klipnızı oluşturarak başlayın." action={<Button><Plus className="mr-2 h-4 w-4" />Klip Oluştur</Button>} />
      )}

      {!loading && boards.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <Link key={board.id} href={`/dashboard/boards/${board.id}`}>
              <Card className="h-full transition-colors hover:border-coral/40 hover:shadow-coral-glow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-coral/10 text-coral-light">
                      <Kanban className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{board.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{board.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono text-muted-foreground">{board.issueCount} görev</span>
                    <span className="text-xs text-muted-foreground">{formatDate(board.updatedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
