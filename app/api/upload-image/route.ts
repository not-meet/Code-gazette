import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = `image-${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()}`;

    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(fileName, file, {
        contentType: file.type,
      });

    if (error) {
      return NextResponse.json({ error: `Image upload failed: ${error.message}` }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName);

    return NextResponse.json({ url: urlData.publicUrl }, { status: 200 });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
