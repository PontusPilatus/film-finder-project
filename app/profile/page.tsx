'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import type { Movie } from '../../types/movie'
import MovieList from '../components/MovieList'

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

export default function Profile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [username, setUsername] = useState('')
  const [userRatings, setUserRatings] = useState<UserRating[]>([])

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
          fetchUserRatings(userProfile.user_id)
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
    return <div className="text-center text-gray-400">Loading...</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow max-w-4xl mx-auto w-full space-y-8">
        {/* Profile Card */}
        <div className="card space-y-6">
          <h1 className="text-2xl font-bold text-gray-100">Your Profile</h1>

          <div className="space-y-4">
            {profile ? (
              <>
                <div>
                  <label className="text-sm text-gray-400">User ID</label>
                  <p className="text-gray-100">{profile.user_id}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field"
                  />
                  <button
                    onClick={updateUsername}
                    className="btn-primary mt-2"
                  >
                    Update Username
                  </button>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-gray-100">{profile.email || 'Not set'}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Account Created</label>
                  <p className="text-gray-100">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Last Login</label>
                  <p className="text-gray-100">
                    {profile.last_login
                      ? new Date(profile.last_login).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-gray-400">No profile data found</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSignOut}
              className="btn-primary bg-red-600 hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Ratings Card */}
        <div className="card space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-100">Your Ratings</h2>
            <span className="text-gray-400">
              {userRatings.length} {userRatings.length === 1 ? 'movie' : 'movies'} rated
            </span>
          </div>

          {userRatings.length > 0 ? (
            <>
              <div className="space-y-4">
                <MovieList 
                  movies={userRatings.map(r => ({
                    ...r.movie,
                    voteAverage: r.rating
                  }))}
                  showDelete={true}
                  onRatingDelete={async () => {
                    await fetchUserRatings(profile?.user_id || 0);
                  }}
                />
              </div>
            </>
          ) : (
            <p className="text-gray-400">You haven't rated any movies yet.</p>
          )}
        </div>
      </div>
    </div>
  )
} 