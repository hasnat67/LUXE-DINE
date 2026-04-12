import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// This API route handles menu item management using the SERVICE_ROLE_KEY
// to securely bypass RLS on the server side.
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, id, item, updates, photoBase64 } = body;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    let result;
    let error;

    switch (action) {
      case 'add':
        result = await supabaseAdmin.from('menu_items').insert([item]).select();
        break;
      case 'update':
        result = await supabaseAdmin.from('menu_items').update(updates).eq('id', id).select();
        break;
      case 'delete':
        result = await supabaseAdmin.from('menu_items').delete().eq('id', id);
        break;
      case 'addSpinPhoto':
        // First get current photos
        const { data: itemData } = await supabaseAdmin.from('menu_items').select('spin_photos').eq('id', id).single();
        const currentPhotos = itemData?.spin_photos || [];
        result = await supabaseAdmin.from('menu_items').update({ spin_photos: [...currentPhotos, photoBase64] }).eq('id', id).select();
        break;
      case 'deleteLastSpinPhoto':
        const { data: itemDataDel } = await supabaseAdmin.from('menu_items').select('spin_photos').eq('id', id).single();
        const currentPhotosDel = itemDataDel?.spin_photos || [];
        if (currentPhotosDel.length > 0) {
          result = await supabaseAdmin.from('menu_items').update({ spin_photos: currentPhotosDel.slice(0, -1) }).eq('id', id).select();
        } else {
          result = { data: null, error: null };
        }
        break;
      case 'clearSpinPhotos':
        result = await supabaseAdmin.from('menu_items').update({ spin_photos: [] }).eq('id', id).select();
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (result.error) {
      console.error(`API Menu Error (${action}):`, result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error('API Menu Server Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
