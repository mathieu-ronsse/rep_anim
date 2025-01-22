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
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
          </svg>
          <span className="text-lg">{user?.profile?.credits || 0} available tokens</span>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        
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