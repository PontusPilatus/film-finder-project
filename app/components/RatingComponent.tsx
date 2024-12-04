'use client'
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface RatingComponentProps {
  movieId: string;
  showDelete?: boolean;
  onRatingSubmit?: () => void;
  onRatingDelete?: (movieId: string) => void;
}

export default function RatingComponent({ 
  movieId, 
  showDelete = false, 
  onRatingSubmit, 
  onRatingDelete
}: RatingComponentProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId && !hasAttemptedFetch) {
      fetchUserRating();
    }
  }, [userId, movieId, hasAttemptedFetch]);

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      
      if (session?.user) {
        const { data, error } = await supabase
          .from('users')
          .select('user_id')
          .eq('email', session.user.email)
          .single();
        
        if (error) {
          console.error('Error fetching user:', error);
          return;
        }
        
        if (data) {
          setUserId(data.user_id);
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  }

  async function fetchUserRating() {
    try {
      if (!userId || !movieId) return;

      setHasAttemptedFetch(true);
      const { data, error } = await supabase
        .from('ratings')
        .select('rating')
        .eq('movie_id', movieId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        // Only log real errors, not "no rating found"
        if (error.code !== 'PGRST116') {
          console.error('Error fetching rating:', error);
        }
        return;
      }

      if (data) {
        setRating(data.rating);
      }
    } catch (error) {
      // Only log unexpected errors
      if (error instanceof Error && !error.message.includes('PGRST116')) {
        console.error('Error:', error);
      }
    }
  }

  async function handleRating(newRating: number) {
    try {
      setLoading(true);
      
      if (!userId) {
        alert('Please log in to rate movies');
        return;
      }

      const { error } = await supabase
        .from('ratings')
        .upsert({
          movie_id: movieId,
          user_id: userId,
          rating: newRating
        }, {
          onConflict: 'movie_id,user_id'
        });

      if (error) {
        throw error;
      }

      setRating(newRating);
      if (onRatingSubmit) {
        onRatingSubmit();
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('movie_id', movieId)
        .eq('user_id', userId);

      if (error) throw error;

      setRating(null);
      if (onRatingDelete) {
        onRatingDelete(movieId);
      }
    } catch (error) {
      console.error('Error deleting rating:', error);
      alert('Failed to delete rating. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                handleRating(star);
              }}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(null)}
              className={`text-2xl ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <span className={
                (hoveredRating !== null ? star <= hoveredRating : star <= (rating || 0))
                  ? 'text-yellow-400'
                  : 'text-gray-400'
              }>
                ★
              </span>
            </button>
          ))}
        </div>
        {showDelete && rating && (
          <button
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Remove rating"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-5 h-5"
            >
              <path 
                fillRule="evenodd" 
                d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>
        )}
      </div>
      {loading && <span className="text-sm text-gray-400">Saving...</span>}
    </div>
  );
} 