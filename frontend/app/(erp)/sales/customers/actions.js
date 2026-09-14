'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../../lib/supabase/server';

const PATH = '/sales/customers';

export async function deleteCustomer(id) {
  const supabase = await createClient();
  const { error } = await supabase.from('customer_individual').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}
