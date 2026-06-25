'use client';
import { useEffect, useState } from 'react';
import { Shield, Download } from 'lucide-react';
import { LoadingSpinner, EmptyState } from '@/components/states';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { formatDateTime, label, unwrapList } from '@/lib/utils';

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityType: string;
  user: { name: string; email: string };
  ipAddress?: string;
  createdAt: string;
  metadata?: string;
}

const demoAudit: AuditEntry[] = [
  { id: '1', action: 'update', entity: 'CF-142 Ödeme API entegrasyonu', entityType: 'issue', user: { name: 'Ayşe Kaya', email: 'ayse@clipforge.com.tr' }, ipAddress: '185.**.**.42', createdAt: new Date().toISOString() },
  { id: '2', action: 'create', entity: 'Sprint 12 — Ödeme Modülü', entityType: 'sprint', user: { name: 'Elif Öztürk', email: 'elif@clipforge.com.tr' }, ipAddress: '176.**.**.18', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', action: 'login', entity: 'Oturum açma', entityType: 'auth', user: { name: 'Mehmet Demir', email: 'mehmet@clipforge.com.tr' }, ipAddress: '78.**.**.91', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: '4', action: 'delete', entity: 'CF-128 Eski test görevi', entityType: 'issue', user: { name: 'Burak Şahin', email: 'burak@clipforge.com.tr' }, ipAddress: '185.**.**.42', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '5', action: 'export', entity: 'Sprint 11 raporu', entityType: 'report', user: { name: 'Ayşe Kaya', email: 'ayse@clipforge.com.tr' }, ipAddress: '185.**.**.42', createdAt: new Date(Date.now() - 172800000).toISOString() },
];

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [usingDemo, setUsingDemo] = useState(false);

  useEffect(() => {
    api.audit.list()
      .then((r) => { setEntries(unwrapList(r) as AuditEntry[]); setUsingDemo(false); })
      .catch(() => { setEntries(demoAudit); setUsingDemo(true); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = entries.filter((e) =>
    !search || e.entity.toLowerCase().includes(search.toLowerCase()) || e.user.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Denetim İzi</h1>
          <p className="text-muted-foreground">KVKK uyumlu tam işlem kaydı — kim, ne, ne zaman</p>
        </div>
        <div className="flex items-center gap-3">
          {usingDemo && <Badge variant="warning">Demo veri</Badge>}
          <Button variant="outline"><Download className="mr-2 h-4 w-4" />Dışa Aktar</Button>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-coral/30 bg-coral/5 p-4">
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-coral-light" />
        <div className="text-sm">
          <p className="font-medium">KVKK Uyumlu Denetim</p>
          <p className="mt-1 text-muted-foreground">Tüm oluşturma, güncelleme, silme ve oturum işlemleri değiştirilemez şekilde kaydedilir. Kurumsal planlarda otomatik raporlama mevcuttur.</p>
        </div>
      </div>

      <Input placeholder="Dosya Sürümü veya kullanıcı ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />

      {loading && <LoadingSpinner />}

      {!loading && filtered.length === 0 && (
        <EmptyState title="Denetim kaydı yok" description="İşlem gerçekleştikçe dosya sürümülar burada görünecek." />
      )}

      {!loading && filtered.length > 0 && (
        <DataTable
          columns={[
            { key: 'createdAt', header: 'Zaman', render: (r) => <span className="font-mono text-xs whitespace-nowrap">{formatDateTime(r.createdAt)}</span> },
            { key: 'action', header: 'İşlem', render: (r) => <Badge variant="outline">{label('auditAction', r.action)}</Badge> },
            { key: 'entity', header: 'Varlık', render: (r) => (
              <div>
                <p className="font-medium">{r.entity}</p>
                <p className="text-xs text-muted-foreground">{r.entityType}</p>
              </div>
            )},
            { key: 'user', header: 'Kullanıcı', render: (r) => (
              <div>
                <p>{r.user.name}</p>
                <p className="text-xs text-muted-foreground">{r.user.email}</p>
              </div>
            )},
            { key: 'ip', header: 'IP', className: 'font-mono text-xs', render: (r) => r.ipAddress ?? '—' },
          ]}
          data={filtered}
          pageSize={20}
        />
      )}
    </div>
  );
}
