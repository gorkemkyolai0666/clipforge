import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function formatDate(d: string | Date) {
  return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d));
}
export function formatDateTime(d: string | Date) {
  return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d));
}
export function formatTime(d: string | Date) {
  return new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' }).format(new Date(d));
}
export function formatNumber(v: number, d = 0) {
  return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
}
export function formatCurrency(v: number) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(v);
}

const maps: Record<string, Record<string, string>> = {
  userRole: { admin: 'Yönetici', product_owner: 'Dosya Sürümü Sahibi', developer: 'Geliştirici', viewer: 'İzleyici', scrum_master: 'Scrum Master' },
  issueStatus: { backlog: 'Beklemede', todo: 'Yapılacak', in_progress: 'Devam Ediyor', in_review: 'İncelemede', done: 'Tamamlandı' },
  issuePriority: { critical: 'Kritik', high: 'Yüksek', medium: 'Orta', low: 'Düşük' },
  issueType: { story: 'Hikaye', bug: 'Hata', task: 'Görev', epic: 'Epik' },
  sprintStatus: { planned: 'Planlandı', active: 'Aktif', completed: 'Tamamlandı' },
  ceremonyType: { standup: 'Günlük Standup', retro: 'Retrospektif', planning: 'Sprint Planlama', review: 'Sprint İncelemesi' },
  planTier: { starter: 'Başlangıç', pro: 'Pro', enterprise: 'Kurumsal' },
  auditAction: { create: 'Oluşturma', update: 'Güncelleme', delete: 'Silme', login: 'Giriş', export: 'Dışa Aktarma' },
  dependencyType: { blocks: 'Engelliyor', blocked_by: 'Engelleniyor', relates_to: 'İlişkili' },
};
export function label(map: keyof typeof maps, key: string) { return maps[map]?.[key] || key; }
export function unwrapList<T>(r: T[] | { data: T[] }) { return Array.isArray(r) ? r : r.data ?? []; }

export function statusBadgeVariant(status: string): 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' {
  const map: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
    active: 'success', done: 'success', completed: 'success', in_progress: 'default',
    planned: 'secondary', todo: 'secondary', backlog: 'outline', in_review: 'warning',
    critical: 'destructive', high: 'warning', medium: 'secondary', low: 'outline',
  };
  return map[status] || 'outline';
}

export function priorityColor(priority: string): string {
  const map: Record<string, string> = {
    critical: 'border-l-destructive',
    high: 'border-l-warning',
    medium: 'border-l-coral',
    low: 'border-l-muted-foreground',
  };
  return map[priority] || 'border-l-border';
}
