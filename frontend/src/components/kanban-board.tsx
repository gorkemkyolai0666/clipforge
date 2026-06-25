'use client';
import { Badge } from '@/components/ui/badge';
import { cn, label, priorityColor } from '@/lib/utils';
import { User } from 'lucide-react';

export interface KanbanIssue {
  id: string;
  key: string;
  title: string;
  priority: string;
  type: string;
  storyPoints?: number;
  assignee?: { name: string } | null;
}

export interface KanbanColumn {
  id: string;
  name: string;
  issues: KanbanIssue[];
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onIssueClick?: (issue: KanbanIssue) => void;
}

export function KanbanBoard({ columns, onIssueClick }: KanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => (
        <div key={col.id} className="kanban-column">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold">{col.name}</h3>
            <span className="font-mono text-xs text-muted-foreground">{col.issues.length}</span>
          </div>
          <div className="flex flex-1 flex-col gap-2 p-3">
            {col.issues.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">Kart yok</p>
            ) : (
              col.issues.map((issue) => (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => onIssueClick?.(issue)}
                  className={cn('kanban-card border-l-4 text-left', priorityColor(issue.priority))}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">{issue.key}</span>
                    <Badge variant="outline" className="text-[10px]">{label('issueType', issue.type)}</Badge>
                  </div>
                  <p className="text-sm font-medium leading-snug">{issue.title}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    {issue.assignee ? (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />{issue.assignee.name}
                      </span>
                    ) : <span />}
                    {issue.storyPoints != null && (
                      <span className="font-mono text-xs text-coral-light">{issue.storyPoints} SP</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
