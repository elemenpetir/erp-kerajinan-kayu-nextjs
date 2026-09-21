import * as React from 'react';
import { cn } from '@/lib/utils/cn';

// Dropdown native terpusat (pengganti selectClass yang diduplikasi di 6 form).
// Tetap <select> asli: aksesibel keyboard, tanpa JS portal, gaya selaras Input.
const NativeSelect = React.forwardRef(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
NativeSelect.displayName = 'NativeSelect';

export { NativeSelect };
