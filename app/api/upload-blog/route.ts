import { prisma } from '@/lib/db';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';


interface BlogContentInput {
  type: 'HEADING' | 'SUBHEADING' | 'PARAGRAPH' | 'CODE_SNIPPET' | 'IMAGE';
  content: string;
  order: number;
  metadata?: { language?: string; caption?: string };
}

interface BlogInput {
  title: string;
  slug: string;
  blog_thumbnail?: string;
  contents: BlogContentInput[];
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: BlogInput = await request.json();
  const { title, slug, blog_thumbnail, contents } = body;

  if (!title || !slug || !contents || !Array.isArray(contents)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    // Check for unique slug
    const existingBlog = await prisma.blog.findUnique({ where: { slug } });
    if (existingBlog) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }

    // Create blog and contents in a transaction
    const blog = await prisma.$transaction(async (tx) => {
      const createdBlog = await tx.blog.create({
        data: {
          title,
          slug,
          author_id: user.id,
          blog_thumbnail: blog_thumbnail,
        },
      });

      await tx.blogContent.createMany({
        data: contents.map((content) => ({
          blog_id: createdBlog.id,
          type: content.type,
          content: content.content,
          order: content.order,
          metadata: content.metadata,
        })),
      });
      return createdBlog;
    });

    return NextResponse.json({ blog, message: 'Blog created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
