'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import type { Movie } from '../../types/movie';
import MovieList from '../components/MovieList';
import { FiStar, FiInfo } from 'react-icons/fi';

interface UserRating {
  movie: Movie;
  rating: number;
}

export default function RatingsPage() {
  const [loading, setLoading] = useState(true);
  const [userRatings, setUserRatings] = useState<UserRating[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        router.push('/login');
        return;
      }

      if (user) {
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('user_id')
          .eq('email', user.email)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
          return;
        }

        if (userProfile) {
          setUserId(userProfile.user_id);
          await fetchUserRatings(userProfile.user_id);
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error in checkUser:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserRatings(userId: number) {
    try {
      // First get the ratings with movie IDs
      const { data: ratings, error: ratingsError } = await supabase
        .from('ratings')
        .select('*')
        .eq('user_id', userId);

      if (ratingsError) {
        console.error('Error fetching ratings:', ratingsError);
        return;
      }

      if (!ratings || ratings.length === 0) {
        setUserRatings([]);
        return;
      }

      // Then get the movies details with all ratings
      const movieIds = ratings.map(r => r.movie_id);
      const { data: movies, error: moviesError } = await supabase
        .from('movies')
        .select(`
          *,
          ratings:ratings(rating)
        `)
        .in('movie_id', movieIds);

      if (moviesError) {
        console.error('Error fetching movies:', moviesError);
        return;
      }

      // Combine ratings with movie details
      const transformedRatings: UserRating[] = ratings.map(userRating => {
        const movie = movies?.find(m => m.movie_id === userRating.movie_id);
        const allRatings = movie?.ratings || [];
        const totalRatings = allRatings.length;
        const averageRating = totalRatings > 0
          ? Math.round((allRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / totalRatings) * 10) / 10
          : null;

        return {
          rating: userRating.rating,
          movie: {
            id: movie?.movie_id.toString() || '',
            title: movie?.title || '',
            overview: movie?.overview || '',
            posterPath: movie?.poster_path || '',
            releaseDate: movie?.year?.toString() || '',
            voteAverage: userRating.rating,
            genres: movie?.genres?.split('|') || [],
            supabaseRatingAverage: averageRating,
            totalRatings
          }
        };
      });

      setUserRatings(transformedRatings);
    } catch (error) {
      console.error('Error in fetchUserRatings:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-blue-400 border-t-transparent"></div>
          <p className="text-gray-400 animate-pulse">Loading your ratings...</p>
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
                Your Ratings
              </span>
            </h1>
            <p className="text-xl text-gray-300/90 mb-8 max-w-xl mx-auto">
              Manage and view all your movie ratings
            </p>
          </div>
        </div>
      </section>

      {/* Ratings Content */}
      <section className="container-wrapper -mt-8 relative z-10 mb-16">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 shadow-[0_8px_32px_rgba(0,0,0,0.24)]">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                              flex items-center justify-center">
                  <FiInfo className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-gray-300">
                  {userRatings.length} {userRatings.length === 1 ? 'movie' : 'movies'} rated
                </p>
              </div>
            </div>

            {userRatings.length > 0 ? (
              <MovieList 
                movies={userRatings.map(r => ({
                  ...r.movie,
                  voteAverage: r.rating
                }))}
                showDelete={true}
                onRatingDelete={async () => {
                  if (userId) {
                    await fetchUserRatings(userId);
                  }
                }}
              />
            ) : (
              <div className="text-center py-16 space-y-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 
                              flex items-center justify-center">
                  <FiStar className="w-10 h-10 text-blue-400/50" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl text-gray-400">No ratings yet</p>
                  <p className="text-gray-500">Start exploring and rating movies!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}