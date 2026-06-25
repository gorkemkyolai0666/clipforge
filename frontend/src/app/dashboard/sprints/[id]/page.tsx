'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingDown } from 'lucide-react';
import { LoadingSpinner, ErrorState } from '@/components/states';
import { StatCard } from '@/components/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table';
import { api } from '@/lib/api';
import { formatDate, label, statusBadgeVariant } from '@/lib/utils';

interface SprintDetail {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  goal?: string;
  committedPoints: number;
  completedPoints: number;
  remainingPoints: number;
  issues?: { id: string; key: string; title: string; status: string; storyPoints: number }[];
}

interface BurndownPoint {
  date: string;
  ideal: number;
  actual: number;
}

const demoSprint: SprintDetail = {
  id: '1',
  name: 'Sprint 12 — Ödeme Modülü',
  status: 'active',
  startDate: '2026-06-16',
  endDate: '2026-06-30',
  goal: 'Ödeme modülü MVP tamamlanması ve sandbox testleri',
  committedPoints: 42,
  completedPoints: 28,
  remainingPoints: 14,
  issues: [
    { id: '1', key: 'CF-142', title: 'Ödeme API entegrasyonu', status: 'in_progress', storyPoints: 8 },
    { id: '2', key: 'CF-143', title: 'Webhook retry mekanizması', status: 'todo', storyPoints: 5 },
    { id: '3', key: 'CF-136', title: 'Dashboard istatistikleri', status: 'in_review', storyPoints: 5 },
    { id: '4', key: 'CF-135', title: 'Proje iskelet kurulumu', status: 'done', storyPoints: 3 },
  ],
};

const demoBurndown: BurndownPoint[] = [
  { date: '2026-06-16', ideal: 42, actual: 42 },
  { date: '2026-06-18', ideal: 36, actual: 38 },
  { date: '2026-06-20', ideal: 30, actual: 34 },
  { date: '2026-06-22', ideal: 24, actual: 28 },
  { date: '2026-06-24', ideal: 18, actual: 14 },
];

export default function SprintDetailPage() {
  const params = useParams();
  const sprintId = params.id as string;
  const [sprint, setSprint] = useState<SprintDetail | null>(null);
  const [burndown, setBurndown] = useState<BurndownPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.sprints.get(sprintId),
      api.sprints.burndown(sprintId),
    ])
      .then(([sprintData, burndownData]) => {
        setSprint(sprintData as SprintDetail);
        setBurndown(Array.isArray(burndownData) ? burndownData : (burndownData as { points: BurndownPoint[] }).points);
        setUsingDemo(false);
      })
      .catch(() => {
        setSprint({ ...demoSprint, id: sprintId });
        setBurndown(demoBurndown);
        setUsingDemo(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [sprintId]);

  const maxPoints = burndown.length ? Math.max(...burndown.flatMap((p) => [p.ideal, p.actual])) : 1;
  const progress = sprint ? Math.round((sprint.completedPoints / sprint.committedPoints) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
            <Link href="/dashboard/sprints"><ArrowLeft className="mr-1 h-4 w-4" />Döngüler</Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold">{sprint?.name ?? 'Sprint'}</h1>
            {sprint && <Badge variant={statusBadgeVariant(sprint.status)}>{label('sprintStatus', sprint.status)}</Badge>}
          </div>
          {sprint?.goal && <p className="mt-1 text-muted-foreground">{sprint.goal}</p>}
        </div>
        {usingDemo && <Badge variant="warning">Demo veri</Badge>}
      </div>

      {loading && <LoadingSpinner />}
      {!loading && !sprint && <ErrorState onRetry={load} />}

      {sprint && !loading && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Taahhüt" value={`${sprint.committedPoints} SP`} mono />
            <StatCard title="Tamamlanan" value={`${sprint.completedPoints} SP`} description={`%${progress} ilerleme`} mono />
            <StatCard title="Kframe" value={`${sprint.remainingPoints} SP`} mono />
            <StatCard title="Süre" value={`${formatDate(sprint.startDate).split(' ')[0]} — ${formatDate(sprint.endDate).split(' ')[0]}`} icon={<TrendingDown className="h-5 w-5" />} />
          </div>

          <Card>
            <CardHeader><CardTitle>Burndown Grafiği</CardTitle></CardHeader>
            <CardContent>
              {burndown.length === 0 ? (
                <p className="text-sm text-muted-foreground">Burndown verisi henüz yok.</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-end gap-1" style={{ height: 160 }}>
                    {burndown.map((point) => (
                      <div key={point.date} className="flex flex-1 flex-col items-center gap-1">
                        <div className="relative flex w-full items-end justify-center gap-0.5" style={{ height: 120 }}>
                          <div className="w-2 rounded-t bg-muted-foreground/30" style={{ height: `${(point.ideal / maxPoints) * 100}%` }} title={`İdeal: ${point.ideal}`} />
                          <div className="w-2 rounded-t bg-coral" style={{ height: `${(point.actual / maxPoints) * 100}%` }} title={`Gerçek: ${point.actual}`} />
                        </div>
                        <span className="font-mono text-[9px] text-muted-foreground">{point.date.slice(5)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-muted-foreground/30" /> İdeal</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-coral" /> Gerçek</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {sprint.issues && sprint.issues.length > 0 && (
            <div>
              <h2 className="mb-4 font-display text-lg font-semibold">Sprint Görevleri</h2>
              <DataTable
                columns={[
                  { key: 'key', header: 'Anahtar', className: 'font-mono text-xs' },
                  { key: 'title', header: 'Başlık' },
                  { key: 'status', header: 'Durum', render: (r) => <Badge variant={statusBadgeVariant(r.status)}>{label('issueStatus', r.status)}</Badge> },
                  { key: 'storyPoints', header: 'SP', className: 'font-mono' },
                ]}
                data={sprint.issues}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
