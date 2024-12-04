'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import type { Movie } from '../../types/movie';
import MovieList from '../components/MovieList';
import { FiStar } from 'react-icons/fi';

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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('user_id')
          .eq('email', user.email)
          .single();

        if (userProfile) {
          setUserId(userProfile.user_id);
          await fetchUserRatings(userProfile.user_id);
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
          <p className="text-gray-400">Loading your ratings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-wrapper max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            Your Ratings
          </h1>
          <p className="text-gray-300 text-lg">
            Manage and view all your movie ratings
          </p>
        </div>

        <div className="card backdrop-blur-lg">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-300">
              You have rated {userRatings.length} {userRatings.length === 1 ? 'movie' : 'movies'}
            </p>
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
            <p className="text-center text-gray-400 py-8">
              You haven't rated any movies yet. Start exploring and rating movies!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}