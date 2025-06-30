import { prisma } from '@/lib/db';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const blogId = searchParams.get('blogId');

  // Validate blogId
  if (!blogId) {
    return NextResponse.json({ error: 'blogId is required' }, { status: 400 });
  }

  try {
    // Fetch comments with user names and replies
    const comments = await prisma.comment.findMany({
      where: { blog_id: blogId },
      select: {
        id: true,
        content: true,
        created_at: true,
        user: { select: { name: true, avatar_url: true } },
        parent_id: true,
        replies: {
          select: {
            id: true,
            content: true,
            created_at: true,
            user: { select: { name: true, avatar_url: true } },
          },
          orderBy: { created_at: 'asc' },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    const { blogId, content, parentId } = await request.json();

    // Validate input
    if (!blogId || !content) {
      return NextResponse.json(
        { error: 'blogId and content are required' },
        { status: 400 }
      );
    }

    // Get authenticated user from Supabase
    const { data, error } = await supabase.auth.getUser();
    const user = data.user;

    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: User must be authenticated' },
        { status: 401 }
      );
    }

    // Verify blog exists
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: { id: true },
    });
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // If parentId is provided, verify the parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true },
      });
      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }
    }

    // Create new comment
    const newComment = await prisma.comment.create({
      data: {
        blog_id: blogId,
        user_id: user.id,
        content,
        parent_id: parentId || null,
      },
      select: {
        id: true,
        content: true,
        created_at: true,
        user: { select: { name: true, avatar_url: true } },
        parent_id: true,
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
