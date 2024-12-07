'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import type { Movie } from '../types/movie';
import MovieList from '../components/MovieList';
import { FiBookmark, FiInfo } from 'react-icons/fi';

interface WatchlistItem {
  movie: Movie;
}

export default function WatchlistPage() {
  const [loading, setLoading] = useState(true);
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
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
          await fetchWatchlist(userProfile.user_id);
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

  async function fetchWatchlist(userId: number) {
    try {
      // First get the watchlist items
      const { data: watchlistItems, error: watchlistError } = await supabase
        .from('watchlist')
        .select('movie_id')
        .eq('user_id', userId);

      if (watchlistError) {
        if (!watchlistError.message?.includes('406')) {
          console.error('Error fetching watchlist:', watchlistError);
        }
        return;
      }

      if (!watchlistItems || watchlistItems.length === 0) {
        setWatchlistItems([]);
        return;
      }

      // Then get the movies details
      const movieIds = watchlistItems.map(item => item.movie_id);
      const { data: movies, error: moviesError } = await supabase
        .from('movies')
        .select(`
          *,
          ratings (rating)
        `)
        .in('movie_id', movieIds);

      if (moviesError) {
        if (!moviesError.message?.includes('406')) {
          console.error('Error fetching movies:', moviesError);
        }
        return;
      }

      if (!movies) {
        setWatchlistItems([]);
        return;
      }

      // Transform the movies data
      const transformedWatchlist: WatchlistItem[] = movies.map(movie => {
        const ratings = movie.ratings || [];
        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0
          ? Math.round((ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / totalRatings) * 10) / 10
          : null;

        return {
          movie: {
            movie_id: movie.movie_id,
            title: movie.title,
            overview: movie.overview,
            posterPath: movie.poster_path,
            releaseDate: movie.release_date,
            year: movie.year,
            voteAverage: movie.vote_average,
            genres: movie.genres?.split('|') || [],
            ratings: ratings,
            supabaseRatingAverage: averageRating,
            totalRatings: totalRatings
          }
        };
      });

      setWatchlistItems(transformedWatchlist);
    } catch (error: any) {
      if (!error.message?.includes('406')) {
        console.error('Error in fetchWatchlist:', error);
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-blue-400 border-t-transparent"></div>
          <p className="text-gray-400 animate-pulse">Loading your watchlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-background-dark/5 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient-ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-background-dark/10 to-transparent animate-pulse-slow"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>

        <div className="relative container-wrapper">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="hero-text inline-block">
                Your Watchlist
              </span>
            </h1>
            <p className="text-xl text-gray-300/90 mb-8 max-w-xl mx-auto">
              Movies you want to watch later
            </p>
          </div>
        </div>
      </section>

      {/* Watchlist Content */}
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
                  {watchlistItems.length} {watchlistItems.length === 1 ? 'movie' : 'movies'} in your watchlist
                </p>
              </div>
            </div>

            {watchlistItems.length > 0 ? (
              <MovieList 
                movies={watchlistItems.map(item => item.movie)}
                showDelete={true}
                onDelete={async (movieId) => {
                  try {
                    if (!userId) return;
                    
                    const { error } = await supabase
                      .from('watchlist')
                      .delete()
                      .eq('movie_id', movieId)
                      .eq('user_id', userId);

                    if (error) throw error;
                    await fetchWatchlist(userId);
                  } catch (error) {
                    console.error('Error removing from watchlist:', error);
                    alert('Failed to remove from watchlist. Please try again.');
                  }
                }}
              />
            ) : (
              <div className="text-center py-16 space-y-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 
                              flex items-center justify-center">
                  <FiBookmark className="w-10 h-10 text-blue-400/50" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl text-gray-400">Your watchlist is empty</p>
                  <p className="text-gray-500">Start adding movies you want to watch!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
} 
