import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * POST /api/admin/upload-model
 * Accepts a .glb file (multipart/form-data) and uploads it to
 * Supabase Storage bucket "models", returning the public URL.
 */
export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'Server is not configured for uploads (Supabase env missing).' },
        { status: 503 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name;
    const ext = fileName.split('.').pop().toLowerCase();

    if (!['glb', 'gltf'].includes(ext)) {
      return NextResponse.json({ error: 'Only .glb / .gltf files allowed' }, { status: 400 });
    }

    const contentType =
      ext === 'glb' ? 'model/gltf-binary' : 'model/gltf+json';

    // Unique filename to prevent collisions
    const uniqueName = `${Date.now()}-${fileName.replace(/\s+/g, '_')}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure the bucket exists (create if not)
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'models');
    if (!bucketExists) {
      await supabaseAdmin.storage.createBucket('models', { public: true });
    }

    const { error: uploadError } = await supabaseAdmin.storage
      .from('models')
      .upload(uniqueName, buffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('models')
      .getPublicUrl(uniqueName);

    return NextResponse.json({ success: true, url: urlData.publicUrl });
  } catch (err) {
    console.error('Upload model error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
