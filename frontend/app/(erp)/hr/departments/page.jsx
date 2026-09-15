import { Building2, Plus } from 'lucide-react';
import { createClient } from '../../../../lib/supabase/server';
import { getDepartmentsPage, getEmployeeOptions, PAGE_SIZE } from '../../../../lib/services/hr';
import { shortId } from '../../../../lib/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '../../../../components/ui/Pagination';
import { CreateForm, RowActions } from './_components/DepartemenForm';

export const dynamic = 'force-dynamic';

export default async function DepartmentsPage({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const [{ items, count, page: safePage }, employees] = await Promise.all([
    getDepartmentsPage(supabase, { page, pageSize: PAGE_SIZE }),
    getEmployeeOptions(supabase),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Departemen</h1>
        <p className="text-sm text-muted-foreground">Struktur organisasi dan penanggung jawab tiap unit.</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <CreateForm employees={employees} />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="w-44">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs">{shortId('DEPT', d.id)}</TableCell>
                  <TableCell className="font-medium">{d.nama_departemen}</TableCell>
                  <TableCell>{d.manager || '-'}</TableCell>
                  <TableCell>
                    <RowActions dept={d} employees={employees} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {items.length === 0 && (
            <EmptyState
              icon={Building2}
              title="Belum ada departemen."
              description="Tambah departemen pertama menggunakan form di atas."
            />
          )}
        </CardContent>
      </Card>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/hr/departments" />
    </div>
  );
}
