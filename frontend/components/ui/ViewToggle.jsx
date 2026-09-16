'use client';

import { useEffect, useState } from 'react';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function usePersistedView(key, initial = 'list') {
  const [view, setView] = useState(initial);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key);
      if (saved === 'list' || saved === 'grid') setView(saved);
    } catch {
      // private mode etc. — fall back to default
    }
  }, [key]);
  function change(next) {
    setView(next);
    try {
      window.localStorage.setItem(key, next);
    } catch {
      // ignore
    }
  }
  return [view, change];
}

export default function ViewToggle({ value, onChange }) {
  return (
    <div className="inline-flex items-center rounded-md border bg-background p-0.5" role="group" aria-label="Tampilan">
      <Button
        variant={value === 'list' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onChange('list')}
        aria-pressed={value === 'list'}
        aria-label="Tampilan list"
      >
        <LayoutList />
      </Button>
      <Button
        variant={value === 'grid' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onChange('grid')}
        aria-pressed={value === 'grid'}
        aria-label="Tampilan grid"
      >
        <LayoutGrid />
      </Button>
    </div>
  );
}
