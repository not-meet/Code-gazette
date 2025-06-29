'use client';

import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { FileUpload } from '@/components/ui/file-upload';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShimmerButton } from './magicui/shimmer-button';

interface BlogContent {
  type: 'HEADING' | 'SUBHEADING' | 'PARAGRAPH' | 'CODE_SNIPPET' | 'IMAGE';
  content: string;
  order: number;
  metadata?: { language?: string; caption?: string };
}

interface FormData {
  title: string;
  slug: string;
  content: string;
  language?: string;
  caption?: string;
}

interface UploadProps {
  onPreview: (data: { title: string; contents: BlogContent[]; authorName: string }) => void;
  authorName: string;
}

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  content: z.string().min(1, 'Content is required'),
  language: z.string().optional(),
  caption: z.string().optional(),
});

export function Upload({ onPreview, authorName }: UploadProps) {
  const [contentType, setContentType] = useState<
    'HEADING' | 'SUBHEADING' | 'PARAGRAPH' | 'CODE_SNIPPET' | 'IMAGE'
  >('PARAGRAPH');
  const { control, handleSubmit, resetField, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      language: 'javascript',
      caption: '',
    },
  });

  const saveToLocalStorage = useCallback((data: { title: string; contents: BlogContent[] }) => {
    localStorage.setItem('blogDraft', JSON.stringify(data));
    onPreview({ ...data, authorName });
  }, [authorName, onPreview]);

  const onSubmit = async (data: FormData) => {
    const draft = JSON.parse(localStorage.getItem('blogDraft') || '{}');
    const newContent: BlogContent = {
      type: contentType,
      content: data.content,
      order: (draft.contents?.length || 0) + 1,
      metadata: contentType === 'CODE_SNIPPET' ? { language: data.language } : contentType === 'IMAGE' ? { caption: data.caption } : undefined,
    };

    const updatedDraft = {
      title: data.title || draft.title || '',
      slug: data.slug || draft.slug || '',
      contents: [...(draft.contents || []), newContent],
    };

    saveToLocalStorage(updatedDraft);
    resetField('content');
    resetField('language');
    resetField('caption');
  };

  const handleUpload = async () => {
    const draft = JSON.parse(localStorage.getItem('blogDraft') || '{}');
    if (!draft.title || !draft.slug || !draft.contents) {
      alert('Please add title, slug, and at least onecontent item');
      return;
    }
    const Base_URL = process.env.NEXT_PUBLIC_BASE_URL;
    try {
      const response = await fetch(`${Base_URL}/api/upload-blog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      localStorage.removeItem('blogDraft');
      alert('Blog uploaded successfully!');
      resetField('title');
      resetField('slug');
      resetField('content');
      resetField('language');
      resetField('caption');
      onPreview({ title: '', contents: [], authorName });
    } catch (error) {
      console.error('Error uploading blog:', error);
      alert('Failed to upload blog');
    }
  };

  const handleFileUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const { url } = await response.json();
      
      // Get current draft from local storage
      const draft = JSON.parse(localStorage.getItem('blogDraft') || '{}');
      
      // Create new image content
      const newContent: BlogContent = {
        type: 'IMAGE',
        content: url,
        order: (draft.contents?.length || 0) + 1,
        metadata: { caption: '' } // Initialize with empty caption
      };

      // Update draft with new content
      const updatedDraft = {
        title: draft.title || '',
        slug: draft.slug || '',
        contents: [...(draft.contents || []), newContent]
      };

      // Save to local storage and update preview
      saveToLocalStorage(updatedDraft);
      
      // Reset the caption field
      resetField('caption');
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#191919] to-[#0d0d0d] rounded-xl p-6 h-full flex flex-col">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-1 flex flex-col min-h-0">
        <div>
          <label className="block text-slate-100 text-lg font-sans font-semibold mb-2">Title</label>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                className="mt-1 bg-black text-slate-100 border-2 border-gray-700 rounded-lg p-3 font-sans text-base placeholder-gray-400 focus:border-white focus:ring-2 focus:ring-white focus:ring-opacity-50"
                placeholder="Enter blog title"
              />
            )}
          />
          {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-slate-100 text-lg font-sans font-semibold mb-2">Slug</label>
          <Controller
            name="slug"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                className="mt-1 bg-black text-slate-100 border-2 border-gray-700 rounded-lg p-3 font-sans text-base placeholder-gray-400 focus:border-white focus:ring-2 focus:ring-white focus:ring-opacity-50"
                placeholder="Enter blog slug (e.g., my-blog)"
              />
            )}
          />
          {errors.slug && <p className="text-red-400 text-sm mt-1">{errors.slug.message}</p>}
        </div>
        <Tabs value={contentType} onValueChange={(value) => setContentType(value as any)} className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="grid grid-cols-5 gap-2 bg-black p-1 rounded-lg font-sans flex-shrink-0">
            <TabsTrigger
              className="data-[state=active]:bg-gray-900 data-[state=active]:text-white text-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              value="HEADING"
            >
              Heading
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-gray-900 data-[state=active]:text-white text-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              value="SUBHEADING"
            >
              Subheading
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-gray-900 data-[state=active]:text-white text-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              value="PARAGRAPH"
            >
              Paragraph
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-gray-900 data-[state=active]:text-white text-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              value="CODE_SNIPPET"
            >
              Code
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-gray-900 data-[state=active]:text-white text-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              value="IMAGE"
            >
              Image
            </TabsTrigger>
          </TabsList>
          <TabsContent value="HEADING" className="mt-4">
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  className="bg-black text-slate-100 border-2 border-gray-700 rounded-lg p-3 font-sans text-base placeholder-gray-400 focus:border-white focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  placeholder="Enter heading"
                />
              )}
            />
            {errors.content && <p className="text-red-400 text-sm mt-1">{errors.content.message}</p>}
          </TabsContent>
          <TabsContent value="SUBHEADING" className="mt-4">
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  className="bg-black text-slate-100 border-2 border-gray-700 rounded-lg p-3 font-sans text-base placeholder-gray-400 focus:border-white focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  placeholder="Enter subheading"
                />
              )}
            />
            {errors.content && <p className="text-red-400 text-sm mt-1">{errors.content.message}</p>}
          </TabsContent>
          <TabsContent value="PARAGRAPH" className="mt-4">
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  className="bg-black text-slate-100 border-2 border-gray-700 rounded-lg p-3 font-sans text-base placeholder-gray-400 focus:border-white focus:ring-2 focus:ring-white focus:ring-opacity-50 min-h-[8rem]"
                  placeholder="Enter paragraph"
                  rows={4}
                />
              )}
            />
            {errors.content && <p className="text-red-400 text-sm mt-1">{errors.content.message}</p>}
          </TabsContent>
          <TabsContent value="CODE_SNIPPET" className="mt-4 flex-1 flex flex-col min-h-0">
            <div className="flex-1 min-h-0 flex flex-col">
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="flex-1 bg-black text-slate-100 border-2 border-gray-700 rounded-lg p-3 font-mono text-sm placeholder-gray-400 focus:border-white focus:ring-2 focus:ring-white focus:ring-opacity-50 min-h-full resize-none"
                    placeholder="Enter code"
                  />
                )}
              />
            </div>
            <div className="mt-2">
              <Controller
                name="language"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="bg-black text-slate-100 border-2 border-gray-700 rounded-lg p-3 font-sans text-base focus:ring-2 focus:ring-white focus:ring-opacity-50">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="bg-black text-slate-100 border-2 border-gray-700 font-sans">
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {errors.content && <p className="text-red-400 text-sm mt-1">{errors.content.message}</p>}
          </TabsContent>
          <TabsContent value="IMAGE" className="mt-4">
            <FileUpload onChange={handleFileUpload} />
            <Controller
              name="caption"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  className="mt-2 bg-black text-slate-100 border-2 border-gray-700 rounded-lg p-3 font-sans text-base placeholder-gray-400 focus:border-white focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  placeholder="Enter image caption (optional)"
                />
              )}
            />
          </TabsContent>
        </Tabs>
        <div className="flex justify-end gap-4 pt-4 mt-auto border-t border-gray-800">
          <ShimmerButton
            type="submit"
            className="relative overflow-hidden group bg-gradient-to-r from-black to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white font-sans font-semibold py-1 px-6 rounded-lg transition-all duration-300"
          >
            Add Content
          </ShimmerButton>
          <Button
            type="button"
            onClick={handleUpload}
            className="relative overflow-hidden group bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white font-sans font-semibold py-1 px-6 rounded-lg transition-all duration-300"
          >
            Upload Blog
          </Button>
        </div>
      </form>
    </div>
  );
}
