'use client';

import MovieRecommendations from '../components/MovieRecommendations';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function RecommendationsPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('user_id')
          .eq('email', user.email)
          .single();
        
        if (userProfile) {
          setUserId(userProfile.user_id);
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-wrapper max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            Your Recommendations
          </h1>
          <p className="text-gray-300 text-lg">
            Discover movies based on your ratings
          </p>
        </div>

        {userId && (
          <div className="card backdrop-blur-lg">
            <MovieRecommendations userId={userId} />
          </div>
        )}
      </div>
    </div>
  );
} 