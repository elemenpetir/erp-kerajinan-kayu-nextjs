import { PAGE_SIZE, rangeOf, cleanQ } from './pagination';

export { PAGE_SIZE };

export async function getAuditLogPage(supabase, { page = 1, pageSize = PAGE_SIZE, q = '' } = {}) {
  const { safePage, from, to } = rangeOf(page, pageSize);
  let query = supabase
    .from('audit_log')
    .select('id,created_at,actor_email,action,entity,entity_id,diff', { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });
  const needle = cleanQ(q);
  if (needle) query = query.or(`actor_email.ilike.%${needle}%,entity.ilike.%${needle}%,action.ilike.%${needle}%`);
  const { data, count, error } = await query.range(from, to);
  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pageSize };
}
