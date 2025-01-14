'use client';

import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/utils/supabase';
import { useEffect, useState } from 'react';

const plans = [
  {
    name: 'Starter',
    credits: 100,
    price: 10,
    features: [
      'Access to all AI tools',
      '100 credits',
      'Valid for 30 days',
      'Email support'
    ]
  },
  {
    name: 'Pro',
    credits: 500,
    price: 40,
    popular: true,
    features: [
      'Access to all AI tools',
      '500 credits',
      'Valid for 30 days',
      'Priority support',
      'Bulk processing'
    ]
  },
  {
    name: 'Enterprise',
    credits: 2000,
    price: 140,
    features: [
      'Access to all AI tools',
      '2000 credits',
      'Valid for 30 days',
      'Premium support',
      'Bulk processing',
      'API access'
    ]
  }
];

export default function Pricing() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const userData = await getCurrentUser();
      setUser(userData);
    }
    loadUser();
  }, []);

  const handlePurchase = (plan) => {
    if (!user) {
      router.push('/login');
      return;
    }
    // Stripe integration will be added here
    alert('Stripe integration coming soon!');
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-400">
          Get the credits you need to power your AI transformations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-gray-800 rounded-lg p-8 ${
              plan.popular ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 -translate-y-1/2 px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-full">
                Most Popular
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-4xl font-bold mb-2">${plan.price}</p>
              <p className="text-gray-400">{plan.credits} credits</p>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <svg
                    className="h-5 w-5 text-blue-500 mr-2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePurchase(plan)}
              className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Get Started
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}