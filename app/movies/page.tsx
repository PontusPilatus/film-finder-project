'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Movie } from '../../types/movie'
import MovieList from '../components/MovieList'
import { FiSearch, FiFilter, FiX } from 'react-icons/fi'

const MOVIES_PER_PAGE = 10;

interface Filters {
  year?: number;
  genre?: string;
  minRating?: number;
}

type SortOption = 'title' | 'rating_desc' | 'rating_asc' | 'most_rated';

export default function Movies() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [filters, setFilters] = useState<Filters>({})
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [availableGenres, setAvailableGenres] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('title');

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [currentPage, filters, sortBy, searchQuery]);

  async function fetchFilterOptions() {
    // Get unique years
    const { data: years } = await supabase
      .from('movies')
      .select('year')
      .order('year')

    if (years) {
      const uniqueYears = Array.from(new Set(years.map(m => m.year))).filter(Boolean)
      setAvailableYears(uniqueYears)
    }

    // Get unique genres
    const { data: genres } = await supabase
      .from('movies')
      .select('genres')

    if (genres) {
      const allGenres = genres
        .map(m => m.genres?.split('|'))
        .flat()
        .filter(Boolean)
      const uniqueGenres = Array.from(new Set(allGenres)).sort()
      setAvailableGenres(uniqueGenres)
    }
  }

  async function handleSearch() {
    setCurrentPage(1)
    await fetchMovies()
  }

  async function fetchMovies() {
    try {
      setLoading(true);

      let query = supabase
        .from('movies')
        .select(`
          *,
          ratings:ratings(rating)
        `);

      // Apply filters
      if (filters.year) {
        query = query.eq('year', filters.year);
      }
      if (filters.genre) {
        query = query.ilike('genres', `%${filters.genre}%`);
      }
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data: movies, error } = await query;

      if (error) throw error;
      if (!movies) return;

      // Transform movies and calculate ratings in one pass
      const transformedMovies = movies.map(movie => {
        const ratings = movie.ratings || [];
        const totalRatings = ratings.length;
        const ratingSum = ratings.reduce((sum: number, r: any) => sum + r.rating, 0);
        const ratingAverage = totalRatings > 0 ? Math.round((ratingSum / totalRatings) * 10) / 10 : null;

        return {
          id: movie.movie_id.toString(),
          title: movie.title,
          overview: movie.overview,
          posterPath: movie.poster_path || '',
          releaseDate: movie.year?.toString() || '',
          voteAverage: ratingAverage || 0,
          genres: movie.genres || '',
          supabaseRatingAverage: ratingAverage,
          totalRatings
        };
      });

      // Sort movies
      transformedMovies.sort((a, b) => {
        switch (sortBy) {
          case 'rating_desc':
            return (b.supabaseRatingAverage || 0) - (a.supabaseRatingAverage || 0);
          case 'rating_asc':
            return (a.supabaseRatingAverage || 0) - (b.supabaseRatingAverage || 0);
          case 'most_rated':
            return b.totalRatings - a.totalRatings;
          default:
            return a.title.localeCompare(b.title);
        }
      });

      setTotalCount(transformedMovies.length);
      const start = (currentPage - 1) * MOVIES_PER_PAGE;
      const end = start + MOVIES_PER_PAGE;
      console.log('Transformed movies before setting:', transformedMovies);
      setMovies(transformedMovies.slice(start, end));

    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(key: keyof Filters, value: any) {
    setCurrentPage(1) // Reset to first page when filter changes
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }))
  }

  const handleGenreClick = (genre: string) => {
    setCurrentPage(1);
    setFilters(prev => ({
      ...prev,
      genre: prev.genre === genre ? undefined : genre // Toggle genre filter
    }));
  };

  const totalPages = Math.ceil(totalCount / MOVIES_PER_PAGE)

  return (
    <div className="min-h-screen space-y-12">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 hero-gradient opacity-30"></div>
        <div className="relative container-wrapper pb-12">
          <div className="text-center space-y-4 pt-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              Discover Movies
            </h1>
            <p className="text-xl text-gray-300">
              Find your next favorite film from our curated collection
            </p>
          </div>

          {/* Search and Filters Card */}
          <div className="card mt-8 bg-[var(--background-card)] backdrop-blur-md border-white/10">
            <div className="space-y-6">
              {/* Search */}
              <div className="flex gap-4">
                <div className="relative flex-grow">
                  <input 
                    type="text" 
                    placeholder="Search for a movie..." 
                    className="input-field pl-10"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      if (e.target.value === '') handleSearch()
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <button 
                  className="btn-primary"
                  onClick={handleSearch}
                >
                  Search
                </button>
              </div>

              {/* Filters and Sorting */}
              <div className="flex flex-wrap gap-4 items-center">
                <select
                  className="input-field max-w-[200px]"
                  value={filters.year || ''}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                >
                  <option value="">All Years</option>
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>

                <select
                  className="input-field max-w-[200px]"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                >
                  <option value="title">Title (A-Z)</option>
                  <option value="rating_desc">Highest Rated</option>
                  <option value="rating_asc">Lowest Rated</option>
                  <option value="most_rated">Most Rated</option>
                </select>

                {/* Active Filters */}
                <div className="flex flex-wrap gap-2">
                  {filters.genre && (
                    <span className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 
                                   flex items-center gap-2 text-sm">
                      {filters.genre}
                      <button
                        onClick={() => handleFilterChange('genre', '')}
                        className="hover:text-white transition-colors"
                      >
                        <FiX />
                      </button>
                    </span>
                  )}

                  {(filters.year || filters.genre) && (
                    <button
                      className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 
                               hover:bg-blue-500/20 transition-colors text-sm flex items-center gap-2"
                      onClick={() => {
                        setFilters({});
                        setCurrentPage(1);
                        setSortBy('title');
                      }}
                    >
                      <FiFilter />
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Movie List Section */}
      <section className="container-wrapper">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
            <p className="mt-4 text-gray-400">Loading movies...</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">No movies found matching your criteria.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <MovieList movies={movies} />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === i + 1
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
} 