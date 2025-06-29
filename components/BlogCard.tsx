import Link from 'next/link';

interface BlogCardProps {
  id: string;
  title: string;
  authorName: string;
  slug: string;
}

export function BlogCard({ id, title, authorName, slug }: BlogCardProps) {
  return (
    <Link href={`/blog/${id}`} key={id}>
      <div className="bg-black rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-slate-100 mb-2">{title}</h2>
        <p className="text-gray-400 text-sm">By {authorName}</p>
      </div>
    </Link>
  );
}
