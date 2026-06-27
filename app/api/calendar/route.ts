import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import type { Task } from '@/types';

// Google Calendar API helper
async function getGoogleAccessToken(refreshToken: string): Promise<string | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type:    'refresh_token',
    }),
  });
  const data = await res.json();
  return data.access_token || null;
}

// POST /api/calendar — sync task deadlines to Google Calendar
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, refresh_token, auth_code } = await req.json();
  const supabase = createServiceClient();

  // Exchange auth code for tokens (first-time connect)
  if (action === 'exchange_code') {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code:          auth_code,
        grant_type:    'authorization_code',
        redirect_uri:  `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/callback`,
      }),
    });
    const tokens = await tokenRes.json();
    if (tokens.error) return NextResponse.json({ error: tokens.error }, { status: 400 });

    // Save refresh token to user profile
    await supabase
      .from('user_profiles')
      .update({ google_refresh_token: tokens.refresh_token })
      .eq('clerk_user_id', userId);

    return NextResponse.json({ success: true, has_calendar: true });
  }

  // Sync tasks to calendar
  if (action === 'sync') {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    const token = refresh_token || profile?.google_refresh_token;
    if (!token) return NextResponse.json({ error: 'Not connected to Google Calendar' }, { status: 400 });

    const accessToken = await getGoogleAccessToken(token);
    if (!accessToken) return NextResponse.json({ error: 'Could not refresh token' }, { status: 401 });

    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .not('deadline', 'is', null)
      .neq('status', 'completed');

    if (!tasks?.length) return NextResponse.json({ synced: 0 });

    let synced = 0;
    const errors: string[] = [];

    for (const task of tasks as Task[]) {
      if (!task.deadline) continue;
      const deadlineDate = new Date(task.deadline);
      const startDate = new Date(deadlineDate.getTime() - task.estimated_hours * 3600000);

      // Create Google Calendar event
      const event = {
        summary:     `⚡ [Deadline Slayer] ${task.title}`,
        description: `Risk Score: ${task.risk_score}%\nCategory: ${task.category}\nEstimated: ${task.estimated_hours}h\n\n${task.ai_recommendation || ''}`,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'Asia/Kolkata',
        },
        end: {
          dateTime: deadlineDate.toISOString(),
          timeZone: 'Asia/Kolkata',
        },
        colorId: task.risk_level === 'critical' ? '11' : task.risk_level === 'high' ? '6' : '9',
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 60 },
            { method: 'popup', minutes: 24 * 60 },
          ],
        },
      };

      const calRes = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (calRes.ok) {
        synced++;
      } else {
        const err = await calRes.json();
        errors.push(`${task.title}: ${err.error?.message}`);
      }
    }

    return NextResponse.json({ synced, total: tasks.length, errors });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

// GET /api/calendar — get OAuth URL for connecting Google Calendar
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const params = new URLSearchParams({
    client_id:    process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/callback`,
    response_type: 'code',
    scope:        'https://www.googleapis.com/auth/calendar.events',
    access_type:  'offline',
    prompt:       'consent',
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  return NextResponse.json({ auth_url: authUrl });
}
