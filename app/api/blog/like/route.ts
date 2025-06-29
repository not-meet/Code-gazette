import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const blogId = searchParams.get('blogId');

  // Validate blogId
  if (!blogId) {
    return NextResponse.json({ error: 'blogId is required' }, { status: 400 });
  }

  try {
    // Fetch blog with likes and dislikes data
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: {
        likes: true,
        dislikes: true,
      },
    });

    // Check if blog exists
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Return the response
    return NextResponse.json(
      {
        likes: blog.likes,
        dislikes: blog.dislikes,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error fetching blog likes/dislikes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
