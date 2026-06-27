import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function PATCH(req: NextRequest) {
  const userId = 'demo-user';

  const { id } = await req.json();
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('schedule_blocks')
    .update({ is_completed: true })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ block: data });
}
