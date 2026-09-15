'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../../lib/supabase/server';

const PATH = '/manufacturing/products';

export async function deleteProduct(id) {
  const supabase = await createClient();
  const { error } = await supabase.from('produk').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}
