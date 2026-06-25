import { cn } from '@/lib/utils';
const variants = {
  default: 'bg-coral/15 text-coral-light border-coral/30',
  secondary: 'bg-coral/15 text-coral-light border-coral/30',
  success: 'bg-success/15 text-success border-success/30',
  warning: 'bg-warning/15 text-warning border-warning/30',
  destructive: 'bg-destructive/15 text-destructive border-destructive/30',
  outline: 'border-border text-muted-foreground',
} as const;
export function Badge({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants }) {
  return <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', variants[variant], className)} {...props} />;
}
