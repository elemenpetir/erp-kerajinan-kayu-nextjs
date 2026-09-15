import * as React from 'react';
import { cn } from '@/lib/utils/cn';

const Label = React.forwardRef(({ className, ...props }, ref) => (
  // ponytail: plain label, no radix dep — sufficient for enterprise forms
  <label
    ref={ref}
    className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
    {...props}
  />
));
Label.displayName = 'Label';

export { Label };
