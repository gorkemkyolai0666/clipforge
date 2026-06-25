'use client';
import { useEffect, useState } from 'react';
import { Inbox, Sparkles, Filter } from 'lucide-react';
import { LoadingSpinner, EmptyState } from '@/components/states';
import { StatCard } from '@/components/stat-card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { label } from '@/lib/utils';

interface TriageIssue {
  id: string;
  title: string;
  priority: string;
  status: string;
  triageScore: number;
  suggestedCluster: string | null;
  board?: { name: string };
}

export default function TriagePage() {
  const [data, setData] = useState<{
    issues: TriageIssue[];
    pipelines: Array<{ name: string; count: number }>;
    ruleCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.triage.inbox()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">İzleyici Drop-off Inbox</h1>
        <p className="text-muted-foreground">İzin/paylaşım çakışma kümeleme ve otomatik çözüm önerileri</p>
      </div>

      {loading && <LoadingSpinner />}

      {!loading && data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard title="Bekleyen Çakışma" value={data.issues.length} icon={<Inbox className="h-5 w-5" />} mono />
            <StatCard title="Kanal Kümesi" value={data.pipelines.length} icon={<Filter className="h-5 w-5" />} mono />
            <StatCard title="Çözüm Kuralları" value={data.ruleCount} icon={<Sparkles className="h-5 w-5" />} mono />
          </div>

          {data.pipelines.length > 0 && (
            <div className="surface-card p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Benzerlik Kümeleri</h2>
              <div className="flex flex-wrap gap-2">
                {data.pipelines.map((c) => (
                  <Badge key={c.name} variant="secondary">{c.name} ({c.count})</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="surface-card divide-y divide-border">
            {data.issues.map((issue) => (
              <div key={issue.id} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-muted/30">
                <div>
                  <div className="font-medium">{issue.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {issue.board?.name} · {label('issueStatus', issue.status)} · Skor: {issue.triageScore}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={issue.priority === 'critical' ? 'destructive' : 'secondary'}>
                    {label('issuePriority', issue.priority)}
                  </Badge>
                  {issue.suggestedCluster && <Badge variant="outline">{issue.suggestedCluster}</Badge>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && !data && (
        <EmptyState title="Triage verisi yüklenemedi" description="API bağlantısını kontrol edin." />
      )}
    </div>
  );
}
