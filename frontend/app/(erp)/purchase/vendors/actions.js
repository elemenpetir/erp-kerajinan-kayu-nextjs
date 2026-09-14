'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../../lib/supabase/server';

const PATH = '/purchase/vendors';

export async function deleteVendor(id) {
  const supabase = await createClient();
  const { error } = await supabase.from('vendor_individual').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}
