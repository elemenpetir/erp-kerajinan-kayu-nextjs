import { PAGE_SIZE, rangeOf } from './pagination';

export { PAGE_SIZE };

export async function getAuditLogPage(supabase, { page = 1, pageSize = PAGE_SIZE } = {}) {
  const { safePage, from, to } = rangeOf(page, pageSize);
  const { data, count, error } = await supabase
    .from('audit_log')
    .select('id,created_at,actor_email,action,entity,entity_id,diff', { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pageSize };
}
