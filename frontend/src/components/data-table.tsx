'use client';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  keyField?: keyof T | ((row: T) => string);
  emptyMessage?: string;
  getRowClassName?: (row: T) => string;
}

export function DataTable<T extends object>({
  columns, data, page = 1, pageSize = 10, onPageChange, keyField = 'id' as keyof T, emptyMessage = 'Dosya Sürümü bulunamadı', getRowClassName,
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const start = (page - 1) * pageSize;
  const rows = data.slice(start, start + pageSize);
  const getKey = (row: T) => (typeof keyField === 'function' ? keyField(row) : String(row[keyField]));

  if (!data.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="data-table">
          <thead>
            <tr>{columns.map((c) => <th key={c.key} className={c.className}>{c.header}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={getKey(row)} className={getRowClassName?.(row)}>
                {columns.map((c) => (
                  <td key={c.key} className={c.className}>
                    {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && onPageChange && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Sayfa {page} / {totalPages} · {data.length} dosya sürümü</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} className={cn('rounded-lg border border-border px-3 py-1.5', page <= 1 && 'opacity-40')} aria-label="Önceki">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className={cn('rounded-lg border border-border px-3 py-1.5', page >= totalPages && 'opacity-40')} aria-label="Sonraki">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
