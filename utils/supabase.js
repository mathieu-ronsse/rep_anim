import { createClient } from '@supabase/supabase-js';

// Use Next.js environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Only create the client if we have the required configuration
let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export async function logServiceUsage({ serviceName, inputImageUrl = null, prompt = null, outputImageUrl = null }) {
  if (!supabase) {
    console.warn('Supabase client not initialized - service usage logging skipped');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('service_usage')
      .insert([
        {
          user_id: 'da59339e-68e1-4da8-a4ec-c3ea0caeb540', // Hardcoded user_id for now
          service_name: serviceName,
          input_image_url: inputImageUrl,
          prompt: prompt,
          output_image_url: outputImageUrl,
          tokens_deducted: 0, // Default value
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Error logging service usage:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error logging service usage:', error);
    return null;
  }
}

export { supabase };