"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface BlogCardProps {
  id: string;
  title: string;
  authorName: string;
  slug: string;
  blog_thumbnail?: string;
}

export function BlogCard({ id, title, authorName, slug, blog_thumbnail }: BlogCardProps) {
  // Debugging: Log the thumbnail URL
  console.log("Blog Thumbnail URL:", blog_thumbnail);

  // Fallback image if blog_thumbnail is invalid or missing
  const fallbackImage = "https://images.unsplash.com/photo-1544077960-604201fe74bc?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1651&q=80";

  // Sanitize URL to handle special characters
  const sanitizedThumbnail = blog_thumbnail ? encodeURI(blog_thumbnail) : fallbackImage;

  return (
    <Link href={`/blog/${id}`} key={id} aria-label={`Read blog: ${title}`} className="block w-full">
      <div className="w-full group/card">
        <div
          className={cn(
            "cursor-pointer overflow-hidden relative rounded-xl shadow-xl h-72 flex flex-col justify-between p-8 transition-all duration-300 group-hover/card:scale-[1.02] group-hover/card:shadow-2xl",
            blog_thumbnail ? "bg-cover bg-center" : "bg-gradient-to-br from-gray-800 to-black"
          )}
          style={{
            backgroundImage: `url(${sanitizedThumbnail})`,
          }}
        >
          {/* Dark overlay on hover */}
          <div className="absolute inset-0 bg-black opacity-0 group-hover/card:opacity-60 transition-opacity duration-300 z-0"></div>

          {/* Author Info */}
          <div className="flex flex-row items-center space-x-4 z-10">
            <div className="flex flex-col">
              <p className="font-signature text-lg text-amber-200">{authorName}</p>
            </div>
          </div>

          {/* Blog Title */}
          <div className="text-content z-10 mt-4">
            <h2 className="font-bold text-2xl md:text-3xl text-gray-50 line-clamp-2">
              {title}
            </h2>
          </div>
        </div>
      </div>
    </Link>
  );
}
