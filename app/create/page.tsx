'use client';

import { useState, useEffect } from 'react';
import { Preview } from '@/components/Preview';
import { Upload } from '@/components/Upload';
import { createClient } from '@/utils/supabase/client';

interface BlogContent {
  type: 'HEADING' | 'SUBHEADING' | 'PARAGRAPH' | 'CODE_SNIPPET' | 'IMAGE';
  content: string;
  order: number;
  metadata?: { language?: string; caption?: string };
}

export default function CreateBlog() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(undefined); // start with undefined

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      console.log("Fetched user ID:", user?.id);
    };
    fetchUser();
  }, []);

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
