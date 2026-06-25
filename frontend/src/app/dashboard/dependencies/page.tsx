'use client';
import { useEffect, useState } from 'react';
import { GitBranch, AlertTriangle } from 'lucide-react';
import { LoadingSpinner, EmptyState } from '@/components/states';
import { DataTable } from '@/components/data-table';
import { StatCard } from '@/components/stat-card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { label, unwrapList } from '@/lib/utils';

interface Dependency {
  id: string;
  sourceIssue: { key: string; title: string; board?: { name: string } };
  targetIssue: { key: string; title: string; board?: { name: string } };
  type: string;
  isCriticalPath?: boolean;
}

const demoDependencies: Dependency[] = [
  { id: '1', sourceIssue: { key: 'CF-142', title: 'Pazarlama Klipsi embed cascade — CF-101', board: { name: 'Pazarlama Klipsi' } }, targetIssue: { key: 'CF-138', title: 'Q2 Kampanya Dosyası v3', board: { name: 'Mühendislik Klipsi' } }, type: 'blocked_by', isCriticalPath: true },
  { id: '2', sourceIssue: { key: 'CF-143', title: 'Mühendislik Klipsi blast-radius riski — CF-102', board: { name: 'Mühendislik Klipsi' } }, targetIssue: { key: 'CF-142', title: 'Pazarlama Klipsi embed cascade — CF-101', board: { name: 'Pazarlama Klipsi' } }, type: 'blocked_by', isCriticalPath: true },
  { id: '3', sourceIssue: { key: 'CF-136', title: 'Arşiv Klipsi link revoke etkisi', board: { name: 'Arşiv Klipsi' } }, targetIssue: { key: 'CF-135', title: 'Yıllık Rapor Paylaşımı', board: { name: 'Kayıt Oturumları' } }, type: 'relates_to', isCriticalPath: false },
  { id: '4', sourceIssue: { key: 'CF-140', title: 'Ana Klip sync conflict', board: { name: 'Ana Klip' } }, targetIssue: { key: 'CF-138', title: 'Q2 Kampanya Dosyası v3', board: { name: 'Mühendislik Klipsi' } }, type: 'blocked_by', isCriticalPath: false },
];

export default function DependenciesPage() {
  const [deps, setDeps] = useState<Dependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);

  useEffect(() => {
    api.dependencies.list()
      .then((r) => { setDeps(unwrapList(r) as Dependency[]); setUsingDemo(false); })
      .catch(() => { setDeps(demoDependencies); setUsingDemo(true); })
      .finally(() => setLoading(false));
  }, []);

  const criticalCount = deps.filter((d) => d.isCriticalPath).length;
  const blockedCount = deps.filter((d) => d.type === 'blocked_by').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Embed Cascade Radarı</h1>
          <p className="text-muted-foreground">Cross-SKU paylaşım ilişkileri ve etki embed cascade</p>
        </div>
        {usingDemo && <Badge variant="warning">Demo veri</Badge>}
      </div>

      {loading && <LoadingSpinner />}

      {!loading && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard title="Toplam Bağımlılık" value={deps.length} icon={<GitBranch className="h-5 w-5" />} mono />
          <StatCard title="Engellenen İlişki" value={blockedCount} description="blocked_by" mono />
          <StatCard title="Kritik Yol" value={criticalCount} description="Kritik yol üzerinde" icon={<AlertTriangle className="h-5 w-5" />} mono />
        </div>
      )}

      {!loading && deps.length === 0 && (
        <EmptyState title="Bağımlılık yok" description="Görevler arası ilişki tanımlandığında burada görünecek." />
      )}

      {!loading && deps.length > 0 && (
        <>
          <div className="surface-card overflow-x-auto p-4">
            <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">Bağımlılık Grafiği (Özet)</h2>
            <div className="flex flex-wrap items-center gap-2">
              {deps.map((d) => (
                <div key={d.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${d.isCriticalPath ? 'border-warning/40 bg-warning/5' : 'border-border bg-muted/30'}`}>
                  <span className="font-mono font-medium">{d.sourceIssue.key}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-muted-foreground">{label('dependencyType', d.type)}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-mono font-medium">{d.targetIssue.key}</span>
                  {d.isCriticalPath && <Badge variant="warning" className="ml-1">Kritik</Badge>}
                </div>
              ))}
            </div>
          </div>

          <DataTable
            columns={[
              { key: 'source', header: 'Kaynak Görev', render: (r) => (
                <div>
                  <span className="font-mono text-xs text-muted-foreground">{r.sourceIssue.key}</span>
                  <p className="font-medium">{r.sourceIssue.title}</p>
                  <p className="text-xs text-muted-foreground">{r.sourceIssue.board?.name}</p>
                </div>
              )},
              { key: 'type', header: 'İlişki', render: (r) => <Badge variant="secondary">{label('dependencyType', r.type)}</Badge> },
              { key: 'target', header: 'Hedef Görev', render: (r) => (
                <div>
                  <span className="font-mono text-xs text-muted-foreground">{r.targetIssue.key}</span>
                  <p className="font-medium">{r.targetIssue.title}</p>
                  <p className="text-xs text-muted-foreground">{r.targetIssue.board?.name}</p>
                </div>
              )},
              { key: 'critical', header: 'Kritik Yol', render: (r) => r.isCriticalPath ? <Badge variant="warning">Evet</Badge> : <span className="text-muted-foreground">—</span> },
            ]}
            data={deps}
          />
        </>
      )}
    </div>
  );
}
