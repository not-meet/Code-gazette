'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Preview } from '@/components/Preview';
import { Upload } from '@/components/Upload';
import { createClient } from '@/utils/supabase/client';
import axios from 'axios';

interface BlogContent {
  type: 'HEADING' | 'SUBHEADING' | 'PARAGRAPH' | 'CODE_SNIPPET' | 'IMAGE';
  content: string;
  order: number;
  metadata?: { language?: string; caption?: string };
}

interface UserProfileResponse {
  role: string | null;
}

export default function CreateBlog() {
  const supabase = createClient();
  const router = useRouter(); // Initialize useRouter
  const [user, setUser] = useState<any>(undefined); // Start with undefined
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  useEffect(() => {
    const checkUserAndRole = async () => {
      try {
        // Fetch user from Supabase
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !user.email) {
          // If user is not authenticated, redirect to home
          router.push('/');
          return;
        }

        setUser(user);
        console.log('Fetched user ID:', user.id);

        // Fetch user role from API
        try {
          const response = await axios.get('/api/user/profile');
          const data: UserProfileResponse = response.data;

          if (data.role !== 'WRITER') {
            // If user is not a WRITER, redirect to home
            router.push('/');
          }
        } catch (error) {
          console.error('Failed to fetch user role:', error);
          // Redirect to home on error (optional, depending on your preference)
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking user authentication:', error);
        // Redirect to home if authentication check fails
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAndRole();
  }, [router]);

  const [previewData, setPreviewData] = useState<{
    title: string;
    contents: BlogContent[];
    authorName: string;
  }>({
    title: '',
    contents: [],
    authorName: user?.email || 'Author',
  });

  useEffect(() => {
    const draft = localStorage.getItem('blogDraft');
    if (draft) {
      setPreviewData({ ...JSON.parse(draft), authorName: 'Author' });
    }
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-[80vh]">
          <Preview
            title={previewData.title}
            contents={previewData.contents}
            authorName={previewData.authorName}
          />
        </div>
        <div className="h-[80vh]">
          <Upload
            onPreview={setPreviewData}
            authorName={user?.email || 'Author'}
          />
        </div>
      </div>
    </div>
  );
}
