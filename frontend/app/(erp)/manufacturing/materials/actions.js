'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../../lib/supabase/server';

const PATH = '/manufacturing/materials';

export async function deleteMaterial(id) {
  const supabase = await createClient();
  const { error } = await supabase.from('bahan').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}
