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
    // Fetch blog with votes data
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: {
        id: true,
        votes: true,
      },
    });

    // Check if blog exists
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Return the response
    return NextResponse.json(
      {
        blogId: blog.id,
        votes: blog.votes,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error fetching blog votes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const { blogId, votes } = await request.json();

    // Validate input
    if (!blogId) {
      return NextResponse.json({ error: 'blogId is required' }, { status: 400 });
    }
    if (typeof votes !== 'number' || !Number.isInteger(votes)) {
      return NextResponse.json({ error: 'Votes must be an integer' }, { status: 400 });
    }

    // Check if blog exists
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: { id: true },
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Update votes
    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: { votes },
      select: {
        id: true,
        votes: true,
      },
    });

    // Return the updated votes
    return NextResponse.json(
      {
        blogId: updatedBlog.id,
        votes: updatedBlog.votes,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error updating blog votes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
