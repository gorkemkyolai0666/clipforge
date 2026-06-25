'use client';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';
const Label = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>) => (
  <LabelPrimitive.Root className={cn('mb-1.5 block text-sm font-medium leading-none text-foreground', className)} {...props} />
);
export { Label };
