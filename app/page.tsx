import { BlogCard } from '@/components/BlogCard';
import { getAllBlogs } from '@/lib/actions/blogs';
interface Blog {
  id: string;
  title: string;
  author: {
    name: string;
  };
  slug: string;
  blog_thumbnail?: string;
}
export default async function Home() {
  const blogs = await getAllBlogs();

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4">
      <header className="mb-12 text-center">
        <h1 className="font-semibold text-gray-400 text-5xl">All the Tech Blogs!</h1>
      </header>
      <div className="w-full space-y-6">
        {blogs.length > 0 ? (
          blogs.map((blog: Blog) => (
            <BlogCard
              key={blog.id}
              id={blog.id}
              title={blog.title}
              authorName={blog.author.name}
              slug={blog.slug}
              blog_thumbnail={blog.blog_thumbnail}
            />
          ))
        ) : (
          <p className="text-slate-100 text-center">No blogs found :(</p>
        )}
      </div>
    </div>
  );
}
