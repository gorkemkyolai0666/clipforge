'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Zap } from 'lucide-react';
import { LoadingSpinner, EmptyState } from '@/components/states';
import { DataTable } from '@/components/data-table';
import { StatCard } from '@/components/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatDate, label, statusBadgeVariant, unwrapList } from '@/lib/utils';

interface Sprint {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  committedPoints: number;
  completedPoints: number;
  velocity?: number;
}

interface VelocityData {
  average: number;
  history: { sprintName: string; velocity: number }[];
}

const demoSprints: Sprint[] = [
  { id: '1', name: 'Sprint 12 — Ödeme Modülü', status: 'active', startDate: '2026-06-16', endDate: '2026-06-30', committedPoints: 42, completedPoints: 28, velocity: 34 },
  { id: '2', name: 'Sprint 11 — Auth & Onboarding', status: 'completed', startDate: '2026-06-02', endDate: '2026-06-15', committedPoints: 38, completedPoints: 36, velocity: 36 },
  { id: '3', name: 'Sprint 10 — Dashboard MVP', status: 'completed', startDate: '2026-05-19', endDate: '2026-06-01', committedPoints: 40, completedPoints: 32, velocity: 32 },
];

const demoVelocity: VelocityData = {
  average: 34,
  history: [
    { sprintName: 'Sprint 10', velocity: 32 },
    { sprintName: 'Sprint 11', velocity: 36 },
    { sprintName: 'Sprint 12', velocity: 28 },
  ],
};

export default function SprintsPage() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [velocity, setVelocity] = useState<VelocityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);

  useEffect(() => {
    Promise.all([
      api.sprints.list().catch(() => demoSprints),
      api.sprints.velocity().catch(() => demoVelocity),
    ])
      .then(([sprintData, velocityData]) => {
        setSprints(unwrapList(sprintData) as Sprint[]);
        setVelocity(velocityData as VelocityData);
        setUsingDemo(sprintData === demoSprints);
      })
      .finally(() => setLoading(false));
  }, []);

  const maxVel = velocity ? Math.max(1, ...velocity.history.map((v) => v.velocity)) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Döngüler</h1>
          <p className="text-muted-foreground">Sprint planlama ve velocity takibi</p>
        </div>
        <div className="flex items-center gap-3">
          {usingDemo && <Badge variant="warning">Demo veri</Badge>}
          <Button><Plus className="mr-2 h-4 w-4" />Yeni Sprint</Button>
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {!loading && velocity && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard title="Ortalama Velocity" value={velocity.average} description="Son 3 sprint" icon={<Zap className="h-5 w-5" />} mono />
          <StatCard title="Aktif Sprint" value={sprints.filter((s) => s.status === 'active').length} description="Devam eden" mono />
          <StatCard title="Tamamlanan" value={sprints.filter((s) => s.status === 'completed').length} description="Toplam sprint" mono />
        </div>
      )}

      {!loading && velocity && (
        <div className="surface-card p-6">
          <h2 className="font-display text-lg font-semibold">Velocity Trendi</h2>
          <div className="mt-4 space-y-3">
            {velocity.history.map((v) => (
              <div key={v.sprintName} className="flex items-center gap-3">
                <span className="w-24 text-sm text-muted-foreground">{v.sprintName}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-coral" style={{ width: `${(v.velocity / maxVel) * 100}%` }} />
                </div>
                <span className="w-12 text-right font-mono text-sm">{v.velocity} SP</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && sprints.length === 0 && (
        <EmptyState title="Henüz sprint yok" description="İlk sprintinizi oluşturarak agile döngünüze başlayın." action={<Button><Plus className="mr-2 h-4 w-4" />Sprint Oluştur</Button>} />
      )}

      {!loading && sprints.length > 0 && (
        <DataTable
          columns={[
            { key: 'name', header: 'Sprint', render: (r) => <Link href={`/dashboard/sprints/${r.id}`} className="font-medium text-coral-light hover:underline">{r.name}</Link> },
            { key: 'status', header: 'Durum', render: (r) => <Badge variant={statusBadgeVariant(r.status)}>{label('sprintStatus', r.status)}</Badge> },
            { key: 'startDate', header: 'Başlangıç', render: (r) => <span className="font-mono text-xs">{formatDate(r.startDate)}</span> },
            { key: 'endDate', header: 'Bitiş', render: (r) => <span className="font-mono text-xs">{formatDate(r.endDate)}</span> },
            { key: 'committedPoints', header: 'Taahhüt', className: 'font-mono', render: (r) => `${r.committedPoints} SP` },
            { key: 'completedPoints', header: 'Tamamlanan', className: 'font-mono', render: (r) => `${r.completedPoints} SP` },
            { key: 'velocity', header: 'Velocity', className: 'font-mono', render: (r) => r.velocity ?? '—' },
          ]}
          data={sprints}
        />
      )}
    </div>
  );
}
