import { cn } from '@/lib/utils';

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center p-8', className)} role="status" aria-label="Yükleniyor">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-coral border-t-transparent" />
      <span className="sr-only">Yükleniyor...</span>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-10 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="surface-card flex flex-col items-center justify-center border-dashed p-12 text-center">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Bir hata oluştu', description = 'Veriler yüklenirken bir sorun oluştu.', onRetry }: {
  title?: string; description?: string; onRetry?: () => void;
}) {
  return (
    <div className="surface-card flex flex-col items-center justify-center border-destructive/20 bg-destructive/5 p-12 text-center">
      <h3 className="font-display text-lg font-semibold text-destructive">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {onRetry && <button onClick={onRetry} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-coral-dark">Tekrar Dene</button>}
    </div>
  );
}

export function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
