'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, supabase, signOut } from '@/utils/supabase';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [serviceUsage, setServiceUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function loadUserAndHistory() {
      try {
        const userData = await getCurrentUser();
        if (!userData) {
          router.push('/login');
          return;
        }
        
        if (mounted) {
          setUser(userData);

          // Fetch service usage history
          const { data: usage, error } = await supabase
            .from('service_usage')
            .select('*')
            .eq('user_id', userData.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setServiceUsage(usage || []);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadUserAndHistory();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h2 className="text-xl font-semibold">Profile</h2>

      <div className="space-y-4 bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mr-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          <div>
            <h2 className="text-xl font-semibold">{user?.profile?.display_name || 'User'}</h2>
            <p className="text-gray-400">{user?.email}</p>
          </div>
        </div>
        
        <div className="flex items-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-yellow-500">
            <path d="M21 6.375c0 2.692-4.03 4.875-9 4.875S3 9.067 3 6.375 7.03 1.5 12 1.5s9 2.183 9 4.875Z" />
            <path d="M12 12.75c2.685 0 5.19-.586 7.078-1.609a8.283 8.283 0 0 0 1.897-1.384c.016.121.025.244.025.368C21 12.817 16.97 15 12 15s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.285 8.285 0 0 0 1.897 1.384C6.809 12.164 9.315 12.75 12 12.75Z" />
            <path d="M12 16.5c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 0 0 1.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 0 0 1.897 1.384C6.809 15.914 9.315 16.5 12 16.5Z" />
            <path d="M12 20.25c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 0 0 1.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 0 0 1.897 1.384C6.809 19.664 9.315 20.25 12 20.25Z" />
          </svg>
          <span className="text-lg">&nbsp; {user?.profile?.credits || 0} available credits</span>
        </div>

        {/* <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
        >
          Logout
        </button> */}
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Your Activity</h2>
        
        {serviceUsage.length === 0 ? (
          <p className="text-gray-400">No activity yet.</p>
        ) : (
          <div className="space-y-4">
            {serviceUsage.map((usage) => (
              <div key={usage.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium capitalize">{usage.service_name}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(usage.created_at).toLocaleString()}
                    </p>
                    {usage.prompt && (
                      <p className="text-sm text-gray-300 mt-2">
                        Prompt: {usage.prompt}
                      </p>
                    )}
                    {usage.input_image_url && (
                      <div className="mt-2">
                        <img 
                          src={usage.input_image_url} 
                          alt="Input" 
                          className="w-20 h-20 object-cover rounded"
                        />
                      </div>
                    )}
                    {usage.output_image_url && (
                      <div className="mt-2">
                        <img 
                          src={usage.output_image_url} 
                          alt="Output" 
                          className="w-20 h-20 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}