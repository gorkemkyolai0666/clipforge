'use client';
import { useEffect, useState } from 'react';
import { Plus, Mail } from 'lucide-react';
import { LoadingSpinner, EmptyState } from '@/components/states';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { label, unwrapList } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  activeIssues: number;
  avatarUrl?: string;
}

const demoTeam: TeamMember[] = [
  { id: '1', name: 'Ayşe Kaya', email: 'ayse@clipforge.com.tr', role: 'product_owner', activeIssues: 4 },
  { id: '2', name: 'Mehmet Demir', email: 'mehmet@clipforge.com.tr', role: 'developer', activeIssues: 6 },
  { id: '3', name: 'Zeynep Arslan', email: 'zeynep@clipforge.com.tr', role: 'developer', activeIssues: 5 },
  { id: '4', name: 'Can Yılmaz', email: 'can@clipforge.com.tr', role: 'developer', activeIssues: 3 },
  { id: '5', name: 'Elif Öztürk', email: 'elif@clipforge.com.tr', role: 'scrum_master', activeIssues: 2 },
  { id: '6', name: 'Burak Şahin', email: 'burak@clipforge.com.tr', role: 'admin', activeIssues: 1 },
];

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);

  useEffect(() => {
    api.team.list()
      .then((r) => { setMembers(unwrapList(r) as TeamMember[]); setUsingDemo(false); })
      .catch(() => { setMembers(demoTeam); setUsingDemo(true); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Ekip</h1>
          <p className="text-muted-foreground">Ekip üyeleri ve roller</p>
        </div>
        <div className="flex items-center gap-3">
          {usingDemo && <Badge variant="warning">Demo veri</Badge>}
          <Button><Plus className="mr-2 h-4 w-4" />Üye Davet Et</Button>
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {!loading && members.length === 0 && (
        <EmptyState title="Ekip üyesi yok" description="İlk ekip üyenizi davet ederek başlayın." action={<Button><Mail className="mr-2 h-4 w-4" />Davet Gönder</Button>} />
      )}

      {!loading && members.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <div key={m.id} className="surface-card p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-coral/15 font-display text-lg font-bold text-coral-light">
                  {m.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{m.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{m.email}</p>
                  <Badge variant="secondary" className="mt-2">{label('userRole', m.role)}</Badge>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
                <span className="text-muted-foreground">Aktif görev</span>
                <span className="font-mono font-semibold">{m.activeIssues}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && members.length > 0 && (
        <DataTable
          columns={[
            { key: 'name', header: 'Ad Soyad', render: (r) => <span className="font-medium">{r.name}</span> },
            { key: 'email', header: 'E-posta' },
            { key: 'role', header: 'Rol', render: (r) => <Badge variant="secondary">{label('userRole', r.role)}</Badge> },
            { key: 'activeIssues', header: 'Aktif Görev', className: 'font-mono' },
          ]}
          data={members}
        />
      )}
    </div>
  );
}
