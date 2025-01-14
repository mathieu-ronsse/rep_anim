import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return { ...user, profile };
}

export async function logServiceUsage({ serviceName, inputImageUrl = null, prompt = null, replicateID = null }) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('service_usage')
      .insert([
        {
          user_id: user?.id,
          service_name: serviceName,
          input_image_url: inputImageUrl || null,
          prompt: prompt || null,
          tokens_deducted: 0,
          replicate_id: replicateID || null,
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