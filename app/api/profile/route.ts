import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  let profile;
  if (existing) {
    const { data } = await supabase
      .from('user_profiles')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('clerk_user_id', userId)
      .select()
      .single();
    profile = data;
  } else {
    const { data } = await supabase
      .from('user_profiles')
      .insert({ ...body, clerk_user_id: userId })
      .select()
      .single();
    profile = data;
  }

  return NextResponse.json({ profile });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();

  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ profile });
}
