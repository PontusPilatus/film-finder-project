'use client'
import React, { useState, useEffect } from 'react';
import { Movie } from '../types/movie';
import Link from 'next/link';
import RatingComponent from './RatingComponent';
import { supabase } from '../lib/supabase';
import { FiBookmark, FiCheck } from 'react-icons/fi';

interface MovieCardProps {
  movie: Movie;
  onGenreClick?: (genre: string) => void;
  showDelete?: boolean;
  onRatingDelete?: (movieId: string) => void;
  onDelete?: (movieId: string) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onGenreClick, showDelete, onRatingDelete, onDelete }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);

      if (session?.user) {
        const { data, error } = await supabase
          .from('users')
          .select('user_id')
          .eq('email', session.user.email)
          .single();

        if (!error && data) {
          setUserId(data.user_id);
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        const { data } = await supabase
          .from('users')
          .select('user_id')
          .eq('email', session.user.email)
          .single();

        if (data) {
          setUserId(data.user_id);
        }
      } else {
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      checkWatchlistStatus();
    }
  }, [userId, movie.movie_id]);

  const checkWatchlistStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', userId)
        .eq('movie_id', movie.movie_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking watchlist status:', error);
      }

      setIsInWatchlist(!!data);
    } catch (error) {
      console.error('Error checking watchlist status:', error);
    }
  };

  const handleWatchlistClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    if (!isLoggedIn || !userId || isLoading) return;

    try {
      setIsLoading(true);

      if (isInWatchlist) {
        const { error } = await supabase
          .from('watchlist')
          .delete()
          .eq('user_id', userId)
          .eq('movie_id', movie.movie_id);

        if (error) throw error;
        setIsInWatchlist(false);
      } else {
        const { error } = await supabase
          .from('watchlist')
          .insert([
            {
              user_id: userId,
              movie_id: movie.movie_id
            }
          ]);

        if (error) throw error;
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
      alert('Failed to update watchlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingDelete = () => {
    if (onRatingDelete) {
      onRatingDelete(movie.movie_id.toString());
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDelete) {
      onDelete(movie.movie_id.toString());
    }
  };

  const genres: string[] = Array.isArray(movie.genres)
    ? movie.genres
    : (movie.genres as string)?.split('|') || [];

  return (
    <Link href={`/movies/${movie.movie_id}`} className="block relative group">
      <div className="glass-card movie-card p-6 transition-all duration-300 hover:scale-[1.02] bg-[#0f172a]/80">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-4 flex-grow">
            <h3 className="text-xl font-bold text-gray-100 group-hover:text-blue-400 transition-colors">
              {movie.title.replace(/\s*\(\d{4}\)$/, '')}
            </h3>
            <div className="space-y-3">
              {movie.releaseDate && (
                <div className="text-sm text-gray-400">
                  <span className="text-gray-500">Released:</span> {movie.releaseDate}
                </div>
              )}
              {movie.genres && (
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre: string, index: number) => (
                    <button
                      key={`${movie.movie_id}-${genre}`}
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        onGenreClick?.(genre.trim());
                      }}
                      className="px-3 py-1.5 text-sm rounded-xl bg-blue-500/10 text-blue-400 
                               hover:bg-blue-500 hover:text-white transition-all duration-300
                               hover:scale-105"
                    >
                      {genre.trim()}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {movie.overview && (
              <p className="text-gray-400 line-clamp-2 leading-relaxed group-hover:text-gray-300 transition-colors">
                {movie.overview}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Watchlist Button */}
            {isLoggedIn && !showDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleWatchlistClick(e);
                }}
                className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${
                  isInWatchlist
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'glass-card hover:bg-white/[0.03] text-blue-400'
                }`}
                disabled={isLoading}
                title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
              >
                {isInWatchlist ? (
                  <FiCheck className="w-5 h-5" />
                ) : (
                  <FiBookmark className="w-5 h-5" />
                )}
              </button>
            )}
            {/* Delete Button */}
            {showDelete && onDelete && (
              <button
                onClick={handleDelete}
                className="p-2.5 rounded-xl glass-card hover:bg-white/[0.03] text-red-400 
                         hover:text-red-300 transition-all duration-300 hover:scale-110"
                title="Remove from watchlist"
              >
                <FiBookmark className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          {isLoggedIn && (
            <div className="flex flex-col gap-2">
              <span className="text-sm text-gray-400">My Rating</span>
              <RatingComponent
                movieId={movie.movie_id.toString()}
                showDelete={showDelete}
                onRatingDelete={handleRatingDelete}
              />
            </div>
          )}
          {movie.supabaseRatingAverage && typeof movie.supabaseRatingAverage === 'number' && (
            <div className={`text-right ${!isLoggedIn ? 'ml-auto' : ''}`}>
              <div className="text-sm text-gray-400">Average Rating</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 
                               bg-clip-text text-transparent">
                  {movie.supabaseRatingAverage.toFixed(1)}
                </span>
                <span className="text-sm text-gray-400">
                  ({movie.totalRatings} {movie.totalRatings === 1 ? 'rating' : 'ratings'})
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MovieCard; 