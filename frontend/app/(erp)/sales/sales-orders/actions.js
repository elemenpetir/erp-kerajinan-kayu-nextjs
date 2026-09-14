'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../../lib/supabase/server';

const PATH = '/sales/sales-orders';

export async function createInvoice(id) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('invoice_sales_order', { p_so_id: id });
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}
