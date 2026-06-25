'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Settings } from 'lucide-react';
import { KanbanBoard, type KanbanColumn } from '@/components/kanban-board';
import { LoadingSpinner, ErrorState } from '@/components/states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface BoardDetail {
  id: string;
  name: string;
  description?: string;
  columns: KanbanColumn[];
}

const demoBoard: BoardDetail = {
  id: '1',
  name: 'Dosya Sürümü Geliştirme',
  description: 'Ana dosya sürümü backlog ve sprint klipsı',
  columns: [
    {
      id: 'backlog',
      name: 'Beklemede',
      issues: [
        { id: '1', key: 'CF-140', title: 'Kullanıcı profil sayfası', priority: 'medium', type: 'story', storyPoints: 5, assignee: { name: 'Ayşe K.' } },
        { id: '2', key: 'CF-141', title: 'E-posta bildirim şablonları', priority: 'low', type: 'task', storyPoints: 3 },
      ],
    },
    {
      id: 'todo',
      name: 'Yapılacak',
      issues: [
        { id: '3', key: 'CF-142', title: 'Ödeme API entegrasyonu', priority: 'high', type: 'story', storyPoints: 8, assignee: { name: 'Mehmet D.' } },
      ],
    },
    {
      id: 'in_progress',
      name: 'Devam Ediyor',
      issues: [
        { id: '4', key: 'CF-138', title: 'JWT auth middleware', priority: 'critical', type: 'task', storyPoints: 5, assignee: { name: 'Can Y.' } },
        { id: '5', key: 'CF-139', title: 'Kanban sürükle-bırak', priority: 'high', type: 'story', storyPoints: 13, assignee: { name: 'Zeynep A.' } },
      ],
    },
    {
      id: 'in_review',
      name: 'İncelemede',
      issues: [
        { id: '6', key: 'CF-136', title: 'Dashboard istatistikleri', priority: 'medium', type: 'story', storyPoints: 5, assignee: { name: 'Ayşe K.' } },
      ],
    },
    {
      id: 'done',
      name: 'Tamamlandı',
      issues: [
        { id: '7', key: 'CF-135', title: 'Proje iskelet kurulumu', priority: 'medium', type: 'task', storyPoints: 3, assignee: { name: 'Mehmet D.' } },
      ],
    },
  ],
};

export default function BoardDetailPage() {
  const params = useParams();
  const boardId = params.id as string;
  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.boards.get(boardId),
      api.boards.columns(boardId),
    ])
      .then(([boardData, columnsData]) => {
        const cols = Array.isArray(columnsData) ? columnsData : (columnsData as { columns: KanbanColumn[] }).columns;
        setBoard({ ...(boardData as Omit<BoardDetail, 'columns'>), columns: cols });
        setUsingDemo(false);
      })
      .catch(() => { setBoard({ ...demoBoard, id: boardId }); setUsingDemo(true); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [boardId]);

  const totalIssues = board?.columns.reduce((sum, c) => sum + c.issues.length, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
            <Link href="/dashboard/boards"><ArrowLeft className="mr-1 h-4 w-4" />Kliplar</Link>
          </Button>
          <h1 className="font-display text-3xl font-bold">{board?.name ?? 'Klip'}</h1>
          <p className="text-muted-foreground">{board?.description ?? 'Kanban klipsı'}</p>
        </div>
        <div className="flex items-center gap-3">
          {usingDemo && <Badge variant="warning">Demo veri</Badge>}
          <span className="font-mono text-sm text-muted-foreground">{totalIssues} görev</span>
          <Button variant="outline" size="icon" aria-label="Klip ayarları"><Settings className="h-4 w-4" /></Button>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {!loading && !board && <ErrorState onRetry={load} />}
      {board && !loading && <KanbanBoard columns={board.columns} />}
    </div>
  );
}
