import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Simple ping query
    const { data, error } = await supabase
      .from('Blog')
      .select('id')
      .limit(1);

    if (error) throw error;

    console.log('Database pinged successfully at:', new Date().toISOString());

    return NextResponse.json({
      success: true,
      message: 'Database pinged successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database ping failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Ping failed'
    }, { status: 500 });
  }
}
