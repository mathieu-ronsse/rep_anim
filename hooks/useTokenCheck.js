'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { getCurrentUser } from '@/utils/supabase';

export function useTokenCheck() {
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState(null);
  const pathname = usePathname();

  const checkTokens = async (requiredTokens) => {
    try {
      const user = await getCurrentUser();
      
      // Not logged in
      if (!user) {
        setMessage({
          title: 'Please login to continue',
          action: {
            label: 'Login',
            href: `/login?redirectTo=${encodeURIComponent(pathname)}`
          }
        });
        setShowMessage(true);
        return false;
      }

      // Not enough credits
      const availableCredits = user.profile?.credits || 0;
      if (availableCredits < requiredTokens) {
        setMessage({
          title: `This action requires ${requiredTokens} credits. You have ${availableCredits} credits.`,
          action: {
            label: 'Buy more credits',
            href: '/pricing'
          }
        });
        setShowMessage(true);
        return false;
      }

      // Has enough credits - proceed with the action
      return true;
    } catch (error) {
      console.error('Error in useTokenCheck:', error);
      setMessage({
        title: 'An error occurred while checking credits. Please try again.',
        action: {
          label: 'Refresh',
          href: pathname
        }
      });
      setShowMessage(true);
      return false;
    }
  };

  return {
    checkTokens,
    showMessage,
    message,
    setShowMessage
  };
}