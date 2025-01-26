import { supabase } from '@/utils/supabase';

export async function uploadToStorage(url, filename) {
  try {
    console.log('Starting upload to storage:', { filename });
    
    // Fetch the image from the URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    //console.log('Image fetched successfully, size:', blob.size);

    // Upload to Supabase Storage
    console.log('Upload image to storage');
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filename, blob, {
        contentType: blob.type,
        upsert: true
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }

    console.log('File uploaded successfully:', data);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filename);

    console.log('Public URL generated:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadToStorage:', error);
    throw error;
  }
}