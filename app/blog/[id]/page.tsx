import { CodeBlock } from '@/components/ui/code-block';
import axios from 'axios';
import { notFound } from 'next/navigation';

type BlogContent = {
  id: string;
  type: 'HEADING' | 'SUBHEADING' | 'PARAGRAPH' | 'CODE_SNIPPET' | 'IMAGE';
  content: string;
  order: number;
  metadata?: { language?: string; caption?: string };
};

type Blog = {
  id: string;
  title: string;
  slug: string;
  author: { name: string; avatar_url?: string };
  contents: BlogContent[];
};

const Base_URL = process.env.NEXT_PUBLIC_BASE_URL;

async function fetchBlog(id: string): Promise<Blog | null> {
  const response = await axios.get(`${Base_URL}/api/blog?blogId=${id}`);

  if (!response) {
    return null;
  }

  return response.data;
}

export default async function BlogPage({ params }: { params: { id: string } }) {
  const blog = await fetchBlog(params.id);

  if (!blog) {
    notFound();
  }

  return (
    <article className="w-full max-w-3xl mx-auto py-12 px-4 text-gray-200 overflow-x-hidden">
      <h1 className="text-4xl font-bold text-center mb-8">{blog.title}</h1>
      <div className="prose prose-invert prose-lg mx-auto w-full max-w-none px-4">
        {blog.contents.map((content) => (
          <div key={content.id} className="mb-6">
            {content.type === 'HEADING' && (
              <h2 className="text-3xl font-sans font-semibold">{content.content}</h2>
            )}
            {content.type === 'SUBHEADING' && (
              <h3 className="text-2xl font-sans font-medium">{content.content}</h3>
            )}
            {content.type === 'PARAGRAPH' && (
              <p className="text-lg leading-relaxed">{content.content}</p>
            )}
            {content.type === 'CODE_SNIPPET' && (
              <>
                <CodeBlock
                  code={content.content}
                  language={content.metadata?.language || 'javascript'}
                  filename={content.metadata?.caption || ''}
                />
                <hr className="my-4 border-t border-gray-700 opacity-50 mx-auto w-1/2 fading-line" />
              </>
            )}
            {content.type === 'IMAGE' && (
              <>
                <figure className="text-center">
                  <img
                    src={content.content}
                    alt={content.metadata?.caption || ''}
                    className="rounded-xl mx-auto w-full max-w-full h-auto object-contain"
                  />
                  {content.metadata?.caption && (
                    <figcaption className="text-sm text-gray-400 mt-2">
                      {content.metadata.caption}
                    </figcaption>
                  )}
                </figure>
                <hr className="my-4 border-t border-gray-700 opacity-50 mx-auto w-1/2 fading-line" />
              </>
            )}
          </div>
        ))}
      </div>
      <footer className="mt-12 text-right">
        <p className="text-2xl font-signature text-amber-200">
          - {blog.author.name}
        </p>
      </footer>
    </article>
  );
}
