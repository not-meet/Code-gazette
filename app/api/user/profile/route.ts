// app/api/user/avatar/route.ts
import { prisma } from '@/lib/db';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = await createClient();

    // Get authenticated user
    const { data, error } = await supabase.auth.getUser();
    console.log(data);

    // Check if user is not authenticated
    if (!data?.user || error || !data.user.email) {
      return NextResponse.json({ avatar_url: null }, { status: 401 });
    }

    const userId = data.user.id;

    // Fetch user's avatar_url from database using Prisma
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        avatar_url: true,
      },
    });

    // Return avatar_url (could be null if not set in DB)
    return NextResponse.json({ avatar_url: user?.avatar_url || null }, { status: 200 });

  } catch (error) {
    console.error('Error fetching avatar:', error);
    return NextResponse.json(
      { error: 'Internal server error', avatar_url: null },
      { status: 500 }
    );
  }
}
