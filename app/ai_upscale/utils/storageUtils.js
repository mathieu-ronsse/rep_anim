import { supabase } from '@/utils/supabase';

export async function uploadToStorage(url, filename) {
  try {
    // Fetch the image from the URL
    const response = await fetch(url);
    const blob = await response.blob();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filename, blob, {
        contentType: blob.type,
        upsert: true
      });

    if (error) {
      // debug
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filename);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading to storage:', error);
    throw error;
  }
}