import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const blogId = searchParams.get('blogId');

  if (!blogId) {
    return NextResponse.json({ error: 'blogId is required' }, { status: 400 });
  }

  try {
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: {
        author: { select: { name: true, avatar_url: true } },
        contents: {
          orderBy: { order: 'asc' },
          select: { id: true, type: true, content: true, order: true, metadata: true },
        },
      },
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(blog, { status: 200 });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
