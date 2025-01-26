'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/utils/supabase';

export default function TokenCheck({ requiredTokens, onSuccess, children }) {
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState(null);

  const handleClick = async () => {
    try {
      const user = await getCurrentUser();
      
      // Not logged in
      if (!user) {
        setMessage(
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <p className="text-gray-300 mb-3">Please login to continue</p>
            <Link 
              href="/login" 
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Login
            </Link>
          </div>
        );
        setShowMessage(true);
        return;
      }

      // Not enough credits
      const availableCredits = user.profile?.credits || 0;
      if (availableCredits < requiredTokens) {
        setMessage(
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <p className="text-gray-300 mb-3">
              This action requires {requiredTokens} credits. You have {availableCredits} credits.
            </p>
            <Link 
              href="/pricing" 
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Buy more credits
            </Link>
          </div>
        );
        setShowMessage(true);
        return;
      }

      // Has enough credits - proceed with the action
      await onSuccess();
    } catch (error) {
      console.error('Error in TokenCheck:', error);
    }
  };

  // Create a new child with the handleClick function
  const childWithClick = {
    ...children,
    props: {
      ...children.props,
      onClick: handleClick
    }
  };

  return (
    <div>
      {childWithClick}
      {showMessage && (
        <div className="mt-4">
          {message}
        </div>
      )}
    </div>
  );
}