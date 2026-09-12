import { createClient } from '../../../../lib/supabase/server';
import { getDepartmentsPage, getEmployeeOptions, PAGE_SIZE } from '../../../../lib/services/hr';
import { shortId } from '../../../../lib/utils/format';
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
    <div>
      <h2>Departemen</h2>
      <CreateForm employees={employees} />
      <table className="table-slate">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama</th>
            <th>Manager</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={4}>Belum ada departemen.</td>
            </tr>
          ) : (
            items.map((d) => (
              <tr key={d.id}>
                <td>{shortId('DEPT', d.id)}</td>
                <td>{d.nama_departemen}</td>
                <td>{d.manager || '-'}</td>
                <td>
                  <RowActions dept={d} employees={employees} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/hr/departments" />
    </div>
  );
}
