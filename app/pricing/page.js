'use client';

import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/utils/supabase';
import { useEffect, useState } from 'react';

const plans = [
  {
    name: 'Small',
    credits: 50,
    price: 6,
    features: [
      '= 50 generations',
      '= 50 upscales',
      '= 25 colorizations',
      '= 1 animation'
    ]
  },
  {
    name: 'Medium',
    credits: 150,
    price: 16,
    popular: true,
    features: [
      '= 150 generations',
      '= 150 upscales',
      '= 75 colorizations',
      '= 3 animations'
    ]
  },
  {
    name: 'Large',
    credits: 300,
    price: 30,
    features: [
      '= 300 generations',
      '= 300 upscales',
      '= 150 colorizations',
      '= 6 animations'
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
          Get the credits you need to power your AI transformations.<br/>
          Purchased credits are valid for 1 year.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-gray-800 rounded-lg p-4 ${
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
                <li key={feature} className="flex items-center text-lg">
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