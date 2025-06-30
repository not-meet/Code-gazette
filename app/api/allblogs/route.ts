import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        blog_thumbnail: true,
        author: {
          select: { name: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(blogs, { status: 200 });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
