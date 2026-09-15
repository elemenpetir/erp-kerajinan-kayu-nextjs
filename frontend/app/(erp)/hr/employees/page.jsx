import { Plus, UserRound } from 'lucide-react';
import { createClient } from '../../../../lib/supabase/server';
import { getEmployeesPage, PAGE_SIZE } from '../../../../lib/services/hr';
import { docCode, shortId } from '../../../../lib/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '../../../../components/ui/Pagination';

export const dynamic = 'force-dynamic';

export default async function EmployeesPage({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getEmployeesPage(supabase, { page });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Karyawan</h1>
          <p className="text-sm text-muted-foreground">Data personel beserta unit kerjanya.</p>
        </div>
        <Button asChild>
          <a href="/hr/employees/new">
            <Plus />
            Tambah Karyawan
          </a>
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Posisi</TableHead>
                <TableHead>Telp</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-28">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((k) => (
                <TableRow key={k.id}>
                  <TableCell className="font-mono text-xs">{docCode('EMP', k.kode, k.id)}</TableCell>
                  <TableCell className="font-medium">{k.nama}</TableCell>
                  <TableCell>{k.posisi || '-'}</TableCell>
                  <TableCell className="tabular-nums">{k.telp || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{k.email || '-'}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/hr/employees/${k.id}`}>Lihat</a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {items.length === 0 && (
            <EmptyState
              icon={UserRound}
              title="Belum ada karyawan"
              description='Klik "Tambah Karyawan" untuk mendaftarkan karyawan pertama.'
            />
          )}
        </CardContent>
      </Card>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/hr/employees" />
    </div>
  );
}
