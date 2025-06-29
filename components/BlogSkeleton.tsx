import { ArrowUp, ArrowDown } from 'lucide-react';

export function BlogSkeleton() {
  return (
    <article className="w-full max-w-3xl mx-auto py-12 px-4 text-gray-200 overflow-x-hidden">
      {/* Title and Like/Dislike Section */}
      <div className="flex items-center justify-between mb-8">
        {/* Like/Dislike Skeleton */}
        <div className="flex flex-col items-center gap-2">
          <div className="p-2 rounded-full bg-gray-800 animate-pulse">
            <ArrowUp className="w-6 h-6 text-gray-600" />
          </div>
          <div className="h-6 w-10 bg-gray-800 rounded animate-pulse" />
          <div className="p-2 rounded-full bg-gray-800 animate-pulse">
            <ArrowDown className="w-6 h-6 text-gray-600" />
          </div>
        </div>
        {/* Title Skeleton */}
        <div className="h-10 w-3/4 bg-gray-800 rounded animate-pulse flex-1 mx-4" />
        {/* Placeholder to balance flex */}
        <div className="w-[60px]" />
      </div>

      {/* Content Skeleton */}
      <div className="prose prose-invert prose-lg mx-auto w-full max-w-none px-4">
        {/* Simulate multiple content sections (e.g., heading, paragraph, code, image) */}
        <div className="mb-6">
          <div className="h-8 w-1/2 bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="mb-6">
          <div className="h-6 w-full bg-gray-800 rounded animate-pulse" />
          <div className="h-6 w-full bg-gray-800 rounded animate-pulse mt-2" />
        </div>
        <div className="mb-6">
          <div className="h-32 w-full bg-gray-800 rounded animate-pulse" />
          <hr className="my-4 border-t border-gray-700 opacity-50 mx-auto w-1/2" />
        </div>
        <div className="mb-6">
          <div className="h-48 w-full bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-4 w-1/3 bg-gray-800 rounded animate-pulse mt-2 mx-auto" />
          <hr className="my-4 border-t border-gray-700 opacity-50 mx-auto w-1/2" />
        </div>
      </div>

      {/* Footer Skeleton */}
      <footer className="mt-12 text-right">
        <div className="h-6 w-1/4 bg-gray-800 rounded animate-pulse ml-auto" />
      </footer>
    </article>
  );
}
