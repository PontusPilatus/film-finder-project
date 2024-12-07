'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiBookmark, FiCheck } from 'react-icons/fi';
import { supabase } from '../lib/supabase';
import RatingComponent from './RatingComponent';

interface Recommendation {
  title: string;
  score: number;
  movieId: number;
  averageRating?: number;
  totalRatings?: number;
  genres?: string[];
}

interface ApiResponse {
  recommendations: Recommendation[];
  method: string;
}

export default function MovieRecommendations({ userId }: { userId: number }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [method, setMethod] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Fetch watchlist status for all movies
    const fetchWatchlist = async () => {
      const { data, error } = await supabase
        .from('watchlist')
        .select('movie_id')
        .eq('user_id', userId);

      if (!error && data) {
        setWatchlist(new Set(data.map(item => item.movie_id)));
      }
    };

    if (userId) {
      fetchWatchlist();
    }
  }, [userId]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/recommendations/${userId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data: ApiResponse = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        setRecommendations(data.recommendations || []);
        setMethod(data.method);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err instanceof Error ? err.message : 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchRecommendations();
    }
  }, [userId]);

  const handleWatchlistClick = async (e: React.MouseEvent, movieId: number) => {
    e.preventDefault();

    try {
      if (watchlist.has(movieId)) {
        // Remove from watchlist
        const { error } = await supabase
          .from('watchlist')
          .delete()
          .eq('user_id', userId)
          .eq('movie_id', movieId);

        if (error) throw error;
        setWatchlist(prev => {
          const next = new Set(prev);
          next.delete(movieId);
          return next;
        });
      } else {
        // Add to watchlist
        const { error } = await supabase
          .from('watchlist')
          .insert([{ user_id: userId, movie_id: movieId }]);

        if (error) throw error;
        setWatchlist(prev => {
          const next = new Set(prev);
          next.add(movieId);
          return next;
        });
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-400 text-lg">Finding the perfect movies for you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-500/10 rounded-lg border border-red-500/20">
        <p className="text-red-400 text-lg mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center p-8 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <p className="text-gray-300 text-lg mb-2">No recommendations available at the moment.</p>
        <p className="text-gray-400">Rate more movies to get even better recommendations!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {recommendations.map((movie, index) => (
        <Link
          key={movie.movieId}
          href={`/movies/${movie.movieId}`}
          className="block"
        >
          <div className="card hover:border-primary group transition-all duration-200">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-grow">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-bold">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-100 group-hover:text-primary transition-colors">
                    {movie.title}
                  </h3>
                </div>

                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre: string) => (
                      <span
                        key={`${movie.movieId}-${genre}`}
                        className="px-2 py-1 text-xs rounded-full bg-blue-900/50 text-blue-200"
                      >
                        {genre.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Watchlist Button */}
              <button
                onClick={(e) => handleWatchlistClick(e, movie.movieId)}
                className={`ml-4 p-2 rounded-full transition-all duration-200 ${watchlist.has(movie.movieId)
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white'
                  }`}
                title={watchlist.has(movie.movieId) ? "Remove from watchlist" : "Add to watchlist"}
              >
                {watchlist.has(movie.movieId) ? (
                  <FiCheck className="w-5 h-5" />
                ) : (
                  <FiBookmark className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              {/* Rating Component */}
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-400">My Rating</span>
                <RatingComponent movieId={movie.movieId.toString()} />
              </div>

              {/* Recommendation Score */}
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-400">Recommendation Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-blue-500/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${(movie.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-primary font-medium">{movie.score.toFixed(2)}</span>
                </div>
              </div>

              {/* Average Rating */}
              {movie.averageRating && (
                <div className="text-right">
                  <div className="text-sm text-gray-400">Average Rating</div>
                  <div className="text-xl font-bold text-primary">
                    {movie.averageRating.toFixed(1)}
                    <span className="text-sm text-gray-400 ml-1">
                      ({movie.totalRatings} {movie.totalRatings === 1 ? 'rating' : 'ratings'})
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}

      <div className="text-center text-sm text-gray-400 mt-8">
        <p>Rate more movies to get even better recommendations!</p>
      </div>
    </div>
  );
} 