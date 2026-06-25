'use client';
import { useEffect, useState } from 'react';
import { Plus, CalendarDays, Clock } from 'lucide-react';
import { LoadingSpinner, EmptyState } from '@/components/states';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatDateTime, label, unwrapList } from '@/lib/utils';

interface Ceremony {
  id: string;
  type: string;
  title: string;
  scheduledAt: string;
  duration: number;
  sprint?: { name: string };
  status: string;
}

const demoCeremonies: Ceremony[] = [
  { id: '1', type: 'standup', title: 'Günlük Standup', scheduledAt: new Date(Date.now() + 86400000).toISOString(), duration: 15, sprint: { name: 'Sprint 12' }, status: 'scheduled' },
  { id: '2', type: 'planning', title: 'Sprint 13 Planlama', scheduledAt: new Date(Date.now() + 604800000).toISOString(), duration: 120, sprint: { name: 'Sprint 13' }, status: 'scheduled' },
  { id: '3', type: 'retro', title: 'Sprint 12 Retrospektif', scheduledAt: new Date(Date.now() + 432000000).toISOString(), duration: 60, sprint: { name: 'Sprint 12' }, status: 'scheduled' },
  { id: '4', type: 'review', title: 'Sprint 11 İnceleme', scheduledAt: new Date(Date.now() - 86400000).toISOString(), duration: 45, sprint: { name: 'Sprint 11' }, status: 'completed' },
];

export default function CeremoniesPage() {
  const [ceremonies, setCeremonies] = useState<Ceremony[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);

  useEffect(() => {
    api.ceremonies.list()
      .then((r) => { setCeremonies(unwrapList(r) as Ceremony[]); setUsingDemo(false); })
      .catch(() => { setCeremonies(demoCeremonies); setUsingDemo(true); })
      .finally(() => setLoading(false));
  }, []);

  const upcoming = ceremonies.filter((c) => c.status === 'scheduled' && new Date(c.scheduledAt) > new Date());
  const past = ceremonies.filter((c) => c.status === 'completed' || new Date(c.scheduledAt) <= new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Seremoniler</h1>
          <p className="text-muted-foreground">Standup, retrospektif ve sprint seremonileri</p>
        </div>
        <div className="flex items-center gap-3">
          {usingDemo && <Badge variant="warning">Demo veri</Badge>}
          <Button><Plus className="mr-2 h-4 w-4" />Seremoni Planla</Button>
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {!loading && ceremonies.length === 0 && (
        <EmptyState title="Planlanmış seremoni yok" description="Standup veya retrospektif oturumu planlayın." action={<Button><CalendarDays className="mr-2 h-4 w-4" />Seremoni Ekle</Button>} />
      )}

      {!loading && upcoming.length > 0 && (
        <div>
          <h2 className="mb-4 font-display text-lg font-semibold">Yaklaşan</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((c) => (
              <Card key={c.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="default">{label('ceremonyType', c.type)}</Badge>
                    <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground"><Clock className="h-3 w-3" />{c.duration} dk</span>
                  </div>
                  <CardTitle className="text-base">{c.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{formatDateTime(c.scheduledAt)}</p>
                  {c.sprint && <p className="mt-1 text-xs text-muted-foreground">{c.sprint.name}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!loading && past.length > 0 && (
        <div>
          <h2 className="mb-4 font-display text-lg font-semibold">Geçmiş</h2>
          <DataTable
            columns={[
              { key: 'type', header: 'Tür', render: (r) => <Badge variant="outline">{label('ceremonyType', r.type)}</Badge> },
              { key: 'title', header: 'Başlık' },
              { key: 'scheduledAt', header: 'Tarih', render: (r) => <span className="font-mono text-xs">{formatDateTime(r.scheduledAt)}</span> },
              { key: 'duration', header: 'Süre', className: 'font-mono', render: (r) => `${r.duration} dk` },
              { key: 'sprint', header: 'Sprint', render: (r) => r.sprint?.name ?? '—' },
            ]}
            data={past}
          />
        </div>
      )}
    </div>
  );
}
