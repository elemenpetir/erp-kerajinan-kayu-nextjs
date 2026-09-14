import { createClient } from '../../../../lib/supabase/server';
import { getEmployeesPage, PAGE_SIZE } from '../../../../lib/services/hr';
import { shortId } from '../../../../lib/utils/format';
import Pagination from '../../../../components/ui/Pagination';

export const dynamic = 'force-dynamic';

export default async function EmployeesPage({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getEmployeesPage(supabase, { page });

  return (
    <div>
      <h2>Karyawan</h2>
      <p>
        <a className="btn" href="/hr/employees/new">
          Tambah Karyawan
        </a>
      </p>
      <table className="table-slate">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama</th>
            <th>Posisi</th>
            <th>Telp</th>
            <th>Email</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((k) => (
            <tr key={k.id}>
              <td>{shortId('EMP', k.id)}</td>
              <td>{k.nama}</td>
              <td>{k.posisi}</td>
              <td>{k.telp}</td>
              <td>{k.email}</td>
              <td>
                <div className="action-buttons">
                  <a href={`/hr/employees/${k.id}`}>Lihat / Edit</a>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={6}>
                <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
                  <p style={{ fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                    Belum ada karyawan
                  </p>
                  <p style={{ fontSize: 14 }}>
                    Klik "Tambah Karyawan" untuk mendaftarkan karyawan pertama.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/hr/employees" />
    </div>
  );
}
