'use client';

import MovieRecommendations from '../components/MovieRecommendations';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function RecommendationsPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
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
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
          <p className="text-gray-400">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-wrapper max-w-6xl space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            Your Recommendations
          </h1>
          <p className="text-gray-300 text-lg">
            Discover movies based on your ratings and preferences
          </p>
        </div>

        {/* Recommendations Section */}
        <div className="card backdrop-blur-lg">
          {userId ? (
            <MovieRecommendations userId={userId} />
          ) : (
            <div className="text-center p-8 text-gray-400">
              Please log in to see your personalized recommendations
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="text-center text-sm text-gray-400">
          <p>
            Recommendations are generated using collaborative filtering and machine learning,
            taking into account your ratings and similar users' preferences.
          </p>
        </div>
      </div>
    </div>
  );
} 