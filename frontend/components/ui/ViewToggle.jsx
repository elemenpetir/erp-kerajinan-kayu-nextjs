'use client';

import { useEffect, useState } from 'react';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    <Tabs value={value} onValueChange={onChange} aria-label="Tampilan">
      <TabsList>
        <TabsTrigger value="list" aria-label="Tampilan list">
          <LayoutList className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger value="grid" aria-label="Tampilan grid">
          <LayoutGrid className="h-4 w-4" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
