import { createClient } from '../../../../lib/supabase/server';
import { getCategoriesPage, PAGE_SIZE } from '../../../../lib/services/manufacturing';
import Pagination from '../../../../components/ui/Pagination';
import ActionButton from '../../../../components/ui/ActionButton';
import CategoryForm from './_components/CategoryForm';
import { deleteCategory } from './actions';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getCategoriesPage(supabase, { page });

  return (
    <div>
      <h2>Manufaktur — Kategori</h2>
      <CategoryForm />
      <table className="table-slate">
        <thead>
          <tr>
            <th>Nama</th>
            <th style={{ width: 120 }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={2}>
                <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🗂️</div>
                  <p style={{ fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                    Belum ada kategori
                  </p>
                  <p style={{ fontSize: 14 }}>Tambah kategori pertama menggunakan form di atas.</p>
                </div>
              </td>
            </tr>
          ) : (
            items.map((kategori) => (
              <tr key={kategori.id}>
                <td>{kategori.nama}</td>
                <td>
                  <div className="action-buttons">
                    <ActionButton
                      run={deleteCategory.bind(null, kategori.id)}
                      confirmText="Hapus kategori ini?"
                      label="Hapus"
                      className="btn-danger"
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/manufacturing/categories" />
    </div>
  );
}
