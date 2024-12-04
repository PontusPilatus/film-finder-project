'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import type { Movie } from '../../types/movie'
import MovieList from '../components/MovieList'
import { FiUser, FiMail, FiCalendar, FiClock, FiEdit2, FiLogOut, FiBookmark } from 'react-icons/fi'
import MovieRecommendations from '../components/MovieRecommendations'

interface UserProfile {
  user_id: number;
  username: string | null;
  email: string | null;
  created_at: string;
  is_legacy: boolean;
  last_login: string | null;
}

interface UserRating {
  movie: Movie;
  rating: number;
}

interface WatchlistItem {
  movie: Movie;
}

export default function Profile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [username, setUsername] = useState('')
  const [userRatings, setUserRatings] = useState<UserRating[]>([])
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([])

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Auth user:', user);

      if (user) {
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single()

        console.log('User profile:', userProfile);

        if (error) {
          console.error('Error fetching user profile:', error)
        } else {
          setProfile(userProfile)
          setUsername(userProfile.username || '')
          console.log('Fetching ratings for user:', userProfile.user_id);
          await Promise.all([
            fetchUserRatings(userProfile.user_id),
            fetchWatchlist(userProfile.user_id)
          ]);
        }
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setLoading(false)
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

  async function fetchWatchlist(userId: number) {
    try {
      console.log('Fetching watchlist for user:', userId);
      
      // First get the watchlist items
      const { data: watchlistItems, error: watchlistError } = await supabase
        .from('watchlist')
        .select('movie_id')
        .eq('user_id', userId);

      if (watchlistError) {
        // Only log real errors, not 406 responses
        if (!watchlistError.message?.includes('406')) {
          console.error('Error fetching watchlist:', watchlistError);
        }
        return;
      }

      if (!watchlistItems || watchlistItems.length === 0) {
        console.log('No watchlist items found');
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
        // Only log real errors, not 406 responses
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
      // Only log real errors, not 406 responses
      if (!error.message?.includes('406')) {
        console.error('Error in fetchWatchlist:', error);
      }
    }
  }

  async function updateUsername() {
    try {
      const { error } = await supabase
        .from('users')
        .update({ username })
        .eq('user_id', profile?.user_id)

      if (error) {
        console.error('Error updating username:', error)
      } else {
        alert('Username updated successfully!')
      }
    } catch (error) {
      console.error('Error updating username:', error)
    }
  }

  async function handleSignOut() {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
          <p className="text-gray-400">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-wrapper max-w-4xl space-y-12">
        {/* Profile Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            Your Profile
          </h1>
          <p className="text-gray-300 text-lg">
            Manage your account and view your movie ratings
          </p>
        </div>

        {/* Profile Information */}
        <div className="card backdrop-blur-lg">
          <div className="space-y-8">
            {profile ? (
              <>
                {/* User ID */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <FiUser className="w-5 h-5 text-blue-400" />
                  <div>
                    <label className="text-sm text-gray-400">User ID</label>
                    <p className="text-gray-100">{profile.user_id}</p>
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <FiEdit2 className="w-4 h-4" />
                    Username
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="input-field flex-grow"
                      placeholder="Enter your username"
                    />
                    <button
                      onClick={updateUsername}
                      className="btn-primary whitespace-nowrap"
                    >
                      Update
                    </button>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <FiMail className="w-5 h-5 text-blue-400" />
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="text-gray-100">{profile.email || 'Not set'}</p>
                  </div>
                </div>

                {/* Account Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <FiCalendar className="w-5 h-5 text-blue-400" />
                    <div>
                      <label className="text-sm text-gray-400">Account Created</label>
                      <p className="text-gray-100">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <FiClock className="w-5 h-5 text-blue-400" />
                    <div>
                      <label className="text-sm text-gray-400">Last Login</label>
                      <p className="text-gray-100">
                        {profile.last_login
                          ? new Date(profile.last_login).toLocaleString()
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sign Out Button */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-400">No profile data found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 