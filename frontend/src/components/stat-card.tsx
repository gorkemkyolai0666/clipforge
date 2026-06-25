import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  mono?: boolean;
}

export function StatCard({ title, value, description, icon, className, mono }: StatCardProps) {
  return (
    <div className={cn('stat-grid-card', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className={cn('mt-2 font-display text-3xl font-bold tracking-tight', mono && 'font-mono')}>{value}</p>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>
        {icon && <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-coral/10 text-coral-light">{icon}</div>}
      </div>
    </div>
  );
}
