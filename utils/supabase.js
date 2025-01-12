import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function logServiceUsage({ serviceName, inputImageUrl = null, prompt = null }) {
  try {
    const { data, error } = await supabase
      .from('service_usage')
      .insert([
        {
          user_id: 'a834f8de-dac0-4162-b5f7-3eacdcab7dc1', // Hardcoded user_id for now
          service_name: serviceName,
          input_image_url: inputImageUrl || null,
          prompt: prompt || null,
          tokens_deducted: 0
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

export async function updateServiceUsage({ id, outputImageUrl }) {
  try {
    const { data, error } = await supabase
      .from('service_usage')
      .update({
        output_image_url: outputImageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating service usage:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error updating service usage:', error);
    return null;
  }
}

export { supabase };