'use client';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { LoadingSpinner, EmptyState } from '@/components/states';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { label, statusBadgeVariant, unwrapList } from '@/lib/utils';

interface Issue {
  id: string;
  key: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  storyPoints?: number;
  assignee?: { name: string } | null;
  board?: { name: string };
}

const demoIssues: Issue[] = [
  { id: '1', key: 'CF-142', title: 'Ödeme API entegrasyonu', type: 'story', status: 'in_progress', priority: 'high', storyPoints: 8, assignee: { name: 'Mehmet D.' }, board: { name: 'Dosya Sürümü Geliştirme' } },
  { id: '2', key: 'CF-143', title: 'Webhook retry mekanizması', type: 'task', status: 'todo', priority: 'medium', storyPoints: 5, assignee: { name: 'Can Y.' }, board: { name: 'Dosya Sürümü Geliştirme' } },
  { id: '3', key: 'CF-138', title: 'JWT auth middleware', type: 'task', status: 'in_progress', priority: 'critical', storyPoints: 5, assignee: { name: 'Can Y.' }, board: { name: 'Altyapı & DevOps' } },
  { id: '4', key: 'CF-136', title: 'Dashboard istatistikleri', type: 'story', status: 'in_review', priority: 'medium', storyPoints: 5, assignee: { name: 'Ayşe K.' }, board: { name: 'Dosya Sürümü Geliştirme' } },
  { id: '5', key: 'CF-130', title: 'Login sayfası responsive düzeltme', type: 'bug', status: 'done', priority: 'low', storyPoints: 2, assignee: { name: 'Zeynep A.' }, board: { name: 'Tasarım Sistemi' } },
];

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [usingDemo, setUsingDemo] = useState(false);

  useEffect(() => {
    api.issues.list()
      .then((r) => { setIssues(unwrapList(r) as Issue[]); setUsingDemo(false); })
      .catch(() => { setIssues(demoIssues); setUsingDemo(true); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = issues.filter((i) =>
    !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.key.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Görevler</h1>
          <p className="text-muted-foreground">Tüm workspace görevleri</p>
        </div>
        <div className="flex items-center gap-3">
          {usingDemo && <Badge variant="warning">Demo veri</Badge>}
          <Button><Plus className="mr-2 h-4 w-4" />Yeni Görev</Button>
        </div>
      </div>

      <Input placeholder="Görev ara (anahtar veya başlık)..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />

      {loading && <LoadingSpinner />}

      {!loading && filtered.length === 0 && (
        <EmptyState title="Görev bulunamadı" description={search ? 'Arama kriterlerinize uygun görev yok.' : 'Henüz görev oluşturulmamış.'} />
      )}

      {!loading && filtered.length > 0 && (
        <DataTable
          columns={[
            { key: 'key', header: 'Anahtar', className: 'font-mono text-xs' },
            { key: 'title', header: 'Başlık', render: (r) => <span className="font-medium">{r.title}</span> },
            { key: 'type', header: 'Tür', render: (r) => <Badge variant="outline">{label('issueType', r.type)}</Badge> },
            { key: 'status', header: 'Durum', render: (r) => <Badge variant={statusBadgeVariant(r.status)}>{label('issueStatus', r.status)}</Badge> },
            { key: 'priority', header: 'Öncelik', render: (r) => <Badge variant={statusBadgeVariant(r.priority)}>{label('issuePriority', r.priority)}</Badge> },
            { key: 'storyPoints', header: 'SP', className: 'font-mono', render: (r) => r.storyPoints ?? '—' },
            { key: 'assignee', header: 'Atanan', render: (r) => r.assignee?.name ?? '—' },
            { key: 'board', header: 'Klip', render: (r) => r.board?.name ?? '—' },
          ]}
          data={filtered}
          pageSize={15}
        />
      )}
    </div>
  );
}
