'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import type { Movie } from '../../types/movie';
import MovieList from '../components/MovieList';
import { FiBookmark } from 'react-icons/fi';

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
            id: movie.movie_id.toString(),
            title: movie.title,
            overview: movie.overview,
            posterPath: movie.poster_path || '',
            releaseDate: movie.year?.toString() || '',
            voteAverage: 0,
            genres: movie.genres?.split('|') || [],
            supabaseRatingAverage: averageRating,
            totalRatings
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
          <p className="text-gray-400">Loading your watchlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-wrapper max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            Your Watchlist
          </h1>
          <p className="text-gray-300 text-lg">
            Movies you want to watch later
          </p>
        </div>

        <div className="card backdrop-blur-lg">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-300">
              You have {watchlistItems.length} {watchlistItems.length === 1 ? 'movie' : 'movies'} in your watchlist
            </p>
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
            <p className="text-center text-gray-400 py-8">
              Your watchlist is empty. Start adding movies you want to watch!
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 