import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined
    }
  }
);

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  try {
    // First, check if we have a session in localStorage
    let session = null;
    
    try {
      // Add timeout to getSession call
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session fetch timeout')), 3000)
      );

      const { data } = await Promise.race([sessionPromise, timeoutPromise]);
      session = data.session;
    } catch (sessionError) {
      console.warn('Session fetch error:', sessionError);
      return null;
    }

    // If no session, return null immediately
    if (!session?.user) {
      return null;
    }

    try {
      // Get user profile with timeout
      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
      );

      const { data: profile, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]);

      if (profileError) {
        console.warn('Profile fetch error:', profileError);
        return {
          ...session.user,
          profile: null
        };
      }

      return {
        ...session.user,
        profile: profile || null
      };
    } catch (profileError) {
      console.warn('Profile fetch error:', profileError);
      return {
        ...session.user,
        profile: null
      };
    }
  } catch (error) {
    console.warn('Error in getCurrentUser:', error);
    return null;
  }
}

// Hardcoded user ID for anonymous usage
const ANONYMOUS_USER_ID = 'a834f8de-dac0-4162-b5f7-3eacdcab7dc1';

export async function logServiceUsage({ serviceName, inputImageUrl = null, prompt = null, replicateID = null, tokensDeducted = 1 }) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id || ANONYMOUS_USER_ID;

    // Start a Supabase transaction using RPC
    const { data: result, error: rpcError } = await supabase.rpc('log_service_usage_and_deduct_tokens', {
      p_user_id: userId,
      p_service_name: serviceName,
      p_input_image_url: inputImageUrl,
      p_prompt: prompt,
      p_tokens_deducted: tokensDeducted,
      p_replicate_id: replicateID
    });

    if (rpcError) {
      console.error('Error in logServiceUsage RPC:', rpcError);
      throw rpcError;
    }

    return result;
  } catch (error) {
    console.error('Error in logServiceUsage:', error);
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
    console.error('Error in updateServiceUsage:', error);
    return null;
  }
}