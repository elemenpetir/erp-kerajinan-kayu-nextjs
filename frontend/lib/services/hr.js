export const PAGE_SIZE = 20;

export async function getDepartmentsPage(supabase, { page = 1, pageSize = PAGE_SIZE } = {}) {
  const safePage = Number.isFinite(+page) && +page > 0 ? Math.floor(+page) : 1;
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from('departemen')
    .select('id,kode,nama_departemen,manager,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pageSize };
}

export async function getEmployeeOptions(supabase) {
  const { data, error } = await supabase
    .from('karyawan')
    .select('id,nama')
    .order('nama', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getEmployeesPage(supabase, { page = 1, pageSize = PAGE_SIZE } = {}) {
  const safePage = Number.isFinite(+page) && +page > 0 ? Math.floor(+page) : 1;
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from('karyawan')
    .select('id,kode,nama,posisi,telp,email,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pageSize };
}
