'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../../lib/supabase/server';

const PATH = '/hr/employees';

export async function deleteEmployee(id) {
  const supabase = await createClient();
  const { error } = await supabase.from('karyawan').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}
