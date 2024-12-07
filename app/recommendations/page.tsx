'use client';

import MovieRecommendations from '../components/MovieRecommendations';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { FiZap, FiInfo } from 'react-icons/fi';

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
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-blue-400 border-t-transparent"></div>
          <p className="text-gray-400 animate-pulse">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-background-dark/5 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-background-dark/10 to-transparent animate-pulse-slow"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>

        <div className="relative container-wrapper">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="hero-text inline-block">
                Your Recommendations
              </span>
            </h1>
            <p className="text-xl text-gray-300/90 mb-8 max-w-xl mx-auto">
              Discover movies based on your ratings and preferences
            </p>
          </div>
        </div>
      </section>

      {/* Recommendations Content */}
      <section className="container-wrapper -mt-8 relative z-10 mb-16">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card p-8 shadow-[0_8px_32px_rgba(0,0,0,0.24)]">
            {userId ? (
              <MovieRecommendations userId={userId} />
            ) : (
              <div className="text-center py-16 space-y-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 
                              flex items-center justify-center">
                  <FiZap className="w-10 h-10 text-blue-400/50" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl text-gray-400">Please log in</p>
                  <p className="text-gray-500">Sign in to see your personalized recommendations</p>
                </div>
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="mt-8 glass-card p-6 shadow-[0_8px_32px_rgba(0,0,0,0.24)]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                            flex items-center justify-center">
                <FiInfo className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-gray-400">
                Recommendations are generated using collaborative filtering and machine learning,
                taking into account your ratings and similar users' preferences.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 