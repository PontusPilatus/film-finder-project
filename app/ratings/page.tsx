'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import type { Movie } from '../types/movie';
import MovieList from '../components/MovieList';
import { FiStar, FiInfo, FiFilter } from 'react-icons/fi';
import CustomSelect from '../components/CustomSelect';

interface UserRating {
  movie: Movie;
  rating: number;
  ratedAt?: string;
}

interface Filters {
  minRating?: number;
  maxRating?: number;
  yearFrom?: number;
  yearTo?: number;
  genres?: string[];
}

type SortOption = 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'title';

export default function RatingsPage() {
  const [loading, setLoading] = useState(true);
  const [userRatings, setUserRatings] = useState<UserRating[]>([]);
  const [filteredRatings, setFilteredRatings] = useState<UserRating[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (userRatings.length > 0) {
      // Extract available years and genres from ratings
      const years = Array.from(new Set(userRatings.map(r => 
        parseInt(r.movie.year || r.movie.releaseDate)
      ))).filter(Boolean).sort();
      setAvailableYears(years);

      const genres = Array.from(new Set(
        userRatings.flatMap(r => r.movie.genres)
      )).filter(Boolean).sort();
      setAvailableGenres(genres);

      // Apply filters and sorting
      let filtered = [...userRatings];

      // Apply filters
      if (filters.minRating) {
        filtered = filtered.filter(r => r.rating >= filters.minRating!);
      }
      if (filters.maxRating) {
        filtered = filtered.filter(r => r.rating <= filters.maxRating!);
      }
      if (filters.yearFrom) {
        filtered = filtered.filter(r => parseInt(r.movie.year || r.movie.releaseDate) >= filters.yearFrom!);
      }
      if (filters.yearTo) {
        filtered = filtered.filter(r => parseInt(r.movie.year || r.movie.releaseDate) <= filters.yearTo!);
      }
      if (filters.genres && filters.genres.length > 0) {
        filtered = filtered.filter(r => 
          filters.genres!.every(genre => r.movie.genres.includes(genre))
        );
      }

      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return (b.ratedAt || '').localeCompare(a.ratedAt || '');
          case 'oldest':
            return (a.ratedAt || '').localeCompare(b.ratedAt || '');
          case 'rating_high':
            return b.rating - a.rating;
          case 'rating_low':
            return a.rating - b.rating;
          case 'title':
            return a.movie.title.localeCompare(b.movie.title);
          default:
            return 0;
        }
      });

      setFilteredRatings(filtered);
    }
  }, [userRatings, filters, sortBy]);

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
        .select('*, created_at')
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
          ratedAt: userRating.created_at,
          movie: {
            id: movie?.movie_id.toString() || '',
            title: movie?.title || '',
            overview: movie?.overview || '',
            posterPath: movie?.poster_path || '',
            releaseDate: movie?.year?.toString() || '',
            year: movie?.year?.toString(),
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

  function handleFilterChange(key: keyof Filters, value: any) {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  }

  const handleGenreClick = (genre: string) => {
    setFilters(prev => {
      const currentGenres = prev.genres || [];
      const newGenres = currentGenres.includes(genre)
        ? currentGenres.filter(g => g !== genre)
        : [...currentGenres, genre];
      
      return {
        ...prev,
        genres: newGenres.length > 0 ? newGenres : undefined
      };
    });
  };

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
            <div className="space-y-8">
              {/* Filters Section */}
              <div className="space-y-6">
                {/* Rating Range and Sort */}
                <div className="flex flex-wrap gap-6">
                  {/* Rating Range */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 block">Rating Range</label>
                    <div className="flex items-center gap-2">
                      <CustomSelect
                        className="w-[120px]"
                        value={filters.minRating?.toString() || ''}
                        onChange={(value) => handleFilterChange('minRating', parseInt(value))}
                        isRating={true}
                        options={[
                          { value: '', label: 'From' },
                          { value: '1', label: '★' },
                          { value: '2', label: '★★' },
                          { value: '3', label: '★★★' },
                          { value: '4', label: '★★★★' },
                          { value: '5', label: '★★★★★' }
                        ]}
                      />

                      <span className="text-gray-400">-</span>

                      <CustomSelect
                        className="w-[120px]"
                        value={filters.maxRating?.toString() || ''}
                        onChange={(value) => handleFilterChange('maxRating', parseInt(value))}
                        isRating={true}
                        options={[
                          { value: '', label: 'To' },
                          { value: '1', label: '★' },
                          { value: '2', label: '★★' },
                          { value: '3', label: '★★★' },
                          { value: '4', label: '★★★★' },
                          { value: '5', label: '★★★★★' }
                        ]}
                      />
                    </div>
                  </div>

                  {/* Year Range */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 block">Year Range</label>
                    <div className="flex items-center gap-2">
                      <CustomSelect
                        className="w-[120px]"
                        value={filters.yearFrom?.toString() || ''}
                        onChange={(value) => handleFilterChange('yearFrom', parseInt(value))}
                        options={[
                          { value: '', label: 'From' },
                          ...availableYears.map(year => ({
                            value: year.toString(),
                            label: year.toString()
                          }))
                        ]}
                      />

                      <span className="text-gray-400">-</span>

                      <CustomSelect
                        className="w-[120px]"
                        value={filters.yearTo?.toString() || ''}
                        onChange={(value) => handleFilterChange('yearTo', parseInt(value))}
                        options={[
                          { value: '', label: 'To' },
                          ...availableYears.map(year => ({
                            value: year.toString(),
                            label: year.toString()
                          }))
                        ]}
                      />
                    </div>
                  </div>

                  {/* Sort */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 block">Sort By</label>
                    <CustomSelect
                      className="w-[200px]"
                      value={sortBy}
                      onChange={(value) => setSortBy(value as SortOption)}
                      options={[
                        { value: 'newest', label: 'Recently Rated' },
                        { value: 'oldest', label: 'Oldest Rated' },
                        { value: 'rating_high', label: 'Highest Rated' },
                        { value: 'rating_low', label: 'Lowest Rated' },
                        { value: 'title', label: 'Title (A-Z)' }
                      ]}
                    />
                  </div>
                </div>

                {/* Genre Tags */}
                <div className="space-y-3">
                  <label className="text-sm text-gray-400 block">Genres (select multiple)</label>
                  <div className="flex flex-wrap gap-2">
                    {availableGenres.map(genre => (
                      <button
                        key={genre}
                        onClick={() => handleGenreClick(genre)}
                        className={`px-4 py-2 rounded-xl text-sm transition-all duration-300 hover:scale-105 ${
                          filters.genres?.includes(genre)
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                            : 'glass-card hover:bg-white/[0.03] text-blue-400'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Filters */}
                {(filters.minRating || filters.maxRating || filters.yearFrom || filters.yearTo || (filters.genres && filters.genres.length > 0)) && (
                  <div className="flex flex-wrap items-center gap-2 pt-4">
                    {/* Show active rating range filter */}
                    {(filters.minRating || filters.maxRating) && (
                      <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                                     flex items-center gap-2 text-sm shadow-lg shadow-blue-500/25">
                        Rating: {filters.minRating || 1} - {filters.maxRating || 5} ★
                        <button
                          onClick={() => {
                            handleFilterChange('minRating', '');
                            handleFilterChange('maxRating', '');
                          }}
                          className="hover:text-blue-200 transition-colors ml-2"
                        >
                          <FiFilter className="w-4 h-4" />
                        </button>
                      </span>
                    )}

                    {/* Show active year range filter */}
                    {(filters.yearFrom || filters.yearTo) && (
                      <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                                     flex items-center gap-2 text-sm shadow-lg shadow-blue-500/25">
                        Year: {filters.yearFrom || 'Any'} - {filters.yearTo || 'Any'}
                        <button
                          onClick={() => {
                            handleFilterChange('yearFrom', '');
                            handleFilterChange('yearTo', '');
                          }}
                          className="hover:text-blue-200 transition-colors ml-2"
                        >
                          <FiFilter className="w-4 h-4" />
                        </button>
                      </span>
                    )}

                    {/* Show active genre filters */}
                    {filters.genres?.map(genre => (
                      <span
                        key={genre}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                                 flex items-center gap-2 text-sm shadow-lg shadow-blue-500/25"
                      >
                        {genre}
                        <button
                          onClick={() => handleGenreClick(genre)}
                          className="hover:text-blue-200 transition-colors ml-2"
                        >
                          <FiFilter className="w-4 h-4" />
                        </button>
                      </span>
                    ))}

                    {/* Clear all filters button */}
                    <button
                      className="px-4 py-2 rounded-xl glass-card hover:bg-white/[0.03]
                               transition-all duration-300 text-sm flex items-center gap-2
                               hover:scale-105"
                      onClick={() => {
                        setFilters({});
                        setSortBy('newest');
                      }}
                    >
                      <FiFilter className="w-4 h-4" />
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                                flex items-center justify-center">
                    <FiInfo className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-gray-300">
                    {filteredRatings.length} of {userRatings.length} {userRatings.length === 1 ? 'movie' : 'movies'} rated
                  </p>
                </div>
              </div>

              {userRatings.length > 0 ? (
                <MovieList 
                  movies={filteredRatings.map(r => ({
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
        </div>
      </section>
    </div>
  );
}