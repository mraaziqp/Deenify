import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type UploadRequest = {
  fileName: string;
  contentType: string;
  mediaType: 'audio' | 'video' | 'image' | 'pdf';
};

const requiredEnv = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as UploadRequest;
    if (!body.fileName || !body.contentType || !body.mediaType) {
      return NextResponse.json({ error: 'Missing fileName, contentType, or mediaType.' }, { status: 400 });
    }

    const supabaseUrl = requiredEnv(process.env.SUPABASE_URL, 'SUPABASE_URL');
    const serviceKey = requiredEnv(process.env.SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SERVICE_ROLE_KEY');
    const bucket = requiredEnv(process.env.SUPABASE_STORAGE_BUCKET, 'SUPABASE_STORAGE_BUCKET');

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const safeName = body.fileName.replace(/[^a-zA-Z0-9._-]/g, '-');
    const path = `quran/${body.mediaType}/${Date.now()}-${safeName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path, 900);

    if (error || !data) {
      return NextResponse.json({ error: 'Unable to create upload URL.' }, { status: 500 });
    }

    const publicUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

    return NextResponse.json({ uploadUrl: data.signedUrl, publicUrl, path });
  } catch (error) {
    console.error('Failed to create upload URL:', error);
    return NextResponse.json({ error: 'Unable to create upload URL.' }, { status: 500 });
  }
}
