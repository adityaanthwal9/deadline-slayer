import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET() {
  const userId = 'demo-user';

  const supabase = createServiceClient();
  const { data: stats } = await supabase
    .from('daily_stats')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(30);

  return NextResponse.json({ stats: stats || [] });
}
