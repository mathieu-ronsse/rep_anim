'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, supabase } from '@/utils/supabase';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [serviceUsage, setServiceUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUserAndHistory() {
      try {
        const userData = await getCurrentUser();
        if (!userData) {
          router.push('/login');
          return;
        }
        
        setUser(userData);

        // Fetch service usage history
        const { data: usage } = await supabase
          .from('service_usage')
          .select('*')
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false });

        setServiceUsage(usage || []);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserAndHistory();
  }, [router]);

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
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="space-y-2">
          <p>Email: {user?.email}</p>
          <p>Credits: {user?.profile?.credits || 0}</p>
          <p>Member since: {new Date(user?.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Usage History</h2>
        
        {serviceUsage.length === 0 ? (
          <p className="text-gray-400">No usage history yet.</p>
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
                  </div>
                  <span className="text-sm text-gray-400">
                    -{usage.tokens_deducted} credits
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}