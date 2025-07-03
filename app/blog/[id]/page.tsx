import { CommentSection } from '@/components/CommentsSection';
import { CodeBlock } from '@/components/ui/code-block';
import { VoteButton } from '@/components/VoteButton';
import axios from 'axios';
import Image from 'next/image';
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
  votes: number;
  author: { name: string; avatar_url?: string };
  contents: BlogContent[];
};

const Base_URL = process.env.NEXT_PUBLIC_BASE_URL;

async function fetchBlog(id: string): Promise<Blog | null> {
  try {
    const response = await axios.get(`${Base_URL}/api/blog?blogId=${id}`);
    return response.data || null;
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}

// Helper function to parse PARAGRAPH content and convert ``url`` to a link
function parseParagraphContent(content: string) {
  const urlPattern = /``(.*?)``/g;
  if (!urlPattern.test(content)) {
    return <span>{content}</span>;
  }

  const parts = content.split(urlPattern);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      // This is the URL inside ``url``
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-300 text-2xl font-signature hover:underline"
        >
          Click here
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

// Fix the type definition for Next.js 15
type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function BlogPage({ params }: PageProps) {
  const { id } = await params;
  const blog = await fetchBlog(id);

  if (!blog) {
    notFound();
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="w-full px-2 sm:px-4">
        <div className="max-w-5xl mx-auto flex">
          {/* Vote Button - Left side */}
          <div className="hidden sm:block mr-4 pt-12">
            <VoteButton blogId={blog.id} initialVotes={blog.votes} />
          </div>

          <article className="w-full max-w-3xl py-6 md:py-12 px-2 text-gray-200 mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-center px-2 break-words">{blog.title}</h1>
        </div>

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
                <p className="text-lg leading-relaxed">
                  {parseParagraphContent(content.content)}
                </p>
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
                    <Image
                      width={500}
                      height={500}
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

        <CommentSection blogId={blog.id} />
          </article>
        </div>
      </div>
    </div>
  );
}
