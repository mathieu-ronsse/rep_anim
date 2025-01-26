import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(
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
  console.log('Attempting signup for email:', email);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) {
    console.error('Signup error:', error);
    throw error;
  }
  console.log('Signup successful:', data);
  return data;
}

export async function signIn(email, password) {
  console.log('Attempting signin for email:', email);
  
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    console.error('Sign in error:', error);
    throw error;
  }

  console.log('Sign in successful, session:', data.session);
  return data;
}

export async function signOut() {
  console.log('Attempting sign out');

  const currentSession = supabase.auth.getSession();
  if (!currentSession) {
    console.log('No active session found');
  // } else {
  //   console.log('Active session found:', currentSession);
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
  console.log('Sign out successful');
}

export async function getCurrentUser() {
  console.log('Getting current user...');
  try {
    // First check if we have a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return null;
    }

    console.log('Session:', session);

    if (!session?.user) {
      console.log('No active session found');
      return null;
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Return user without profile instead of failing completely
        return {
          ...session.user,
          profile: null
        };
      }

      const userData = {
        ...session.user,
        profile: profile || null
      };
      
      console.log('Returning user data:', userData);
      return userData;
    } catch (profileError) {
      console.error('Profile fetch error:', profileError);
      // Return user without profile instead of failing completely
      return {
        ...session.user,
        profile: null
      };
    }
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

// Hardcoded user ID for anonymous usage
const ANONYMOUS_USER_ID = 'a834f8de-dac0-4162-b5f7-3eacdcab7dc1';

export async function logServiceUsage({ serviceName, inputImageUrl = null, prompt = null, replicateID = null }) {
  try {
    console.log('Logging service usage...');
    
    // Get current user or use anonymous ID
    const user = await getCurrentUser();
    const userId = user?.id || ANONYMOUS_USER_ID;

    const { data, error } = await supabase
      .from('service_usage')
      .insert([
        {
          user_id: userId,
          service_name: serviceName,
          input_image_url: inputImageUrl,
          prompt: prompt,
          tokens_deducted: 1,
          replicate_id: replicateID
        }
      ])
      .select();

    if (error) {
      console.error('Error logging service usage:', error);
      // Don't throw error for service usage logging
      return null;
    }

    console.log('Service usage logged successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in logServiceUsage:', error);
    // Don't throw error for service usage logging
    return null;
  }
}

export async function updateServiceUsage({ id, outputImageUrl }) {
  try {
    console.log('Updating service usage:', { id, outputImageUrl });
    
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
      // Don't throw error for service usage updates
      return null;
    }

    console.log('Service usage updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in updateServiceUsage:', error);
    // Don't throw error for service usage updates
    return null;
  }
}

export { supabase };