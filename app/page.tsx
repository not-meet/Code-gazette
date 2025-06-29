import { BlogCard } from '@/components/BlogCard';
import axios from 'axios';

type Blog = {
  id: string;
  title: string;
  slug: string;
  author: { name: string };
};

const Base_URL = process.env.NEXT_PUBLIC_BASE_URL;

async function fetchAllBlogs(): Promise<Blog[]> {
  const response = await axios.get(`${Base_URL}/api/allblogs`);

  if (!response) {
    return [];
  }

  return response.data;
}

export default async function Home() {
  const blogs = await fetchAllBlogs();

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <header className="mb-12">
        <h1 className="font-semibold text-slate-100 text-5xl text-left">Tech Letters</h1>
        <p className="text-slate-100 text-lg mt-2 text-left">Hey there, it’s the first time building stuff</p>
        <p className="font-dancing text-slate-100 text-4xl mt-4 text-left">- Meet Jain</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {blogs.length > 0 ? (
          blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              id={blog.id}
              title={blog.title}
              authorName={blog.author.name}
              slug={blog.slug}
            />
          ))
        ) : (
          <p className="text-slate-100 text-center col-span-full">No blogs found.</p>
        )}
      </div>
    </div>
  );
}
