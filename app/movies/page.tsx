'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Movie } from '../../types/movie'
import MovieList from '../components/MovieList'

const MOVIES_PER_PAGE = 10;

interface Filters {
  year?: number;
  genre?: string;
  minRating?: number;
}

type SortOption = 'title' | 'rating_desc' | 'rating_asc' | 'most_rated';

interface MovieRating {
  avg: number;
  count: number;
  sum: number;
}

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
    <div className="space-y-8">
      {/* Search and Filters Section */}
      <div className="card bg-gradient-to-r from-blue-900 to-blue-800 border-none">
        <h2 className="text-2xl font-bold mb-6 text-white">Discover Your Next Favorite Movie</h2>
        
        {/* Search */}
        <div className="flex gap-4 mb-6">
          <input 
            type="text" 
            placeholder="Search for a movie..." 
            className="input-field flex-grow"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (e.target.value === '') {
                handleSearch()
              }
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            className="btn-primary"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>

        {/* Filters and Sorting */}
        <div className="flex gap-4 flex-wrap items-center">
          {/* Year Filter */}
          <select
            className="input-field"
            value={filters.year || ''}
            onChange={(e) => handleFilterChange('year', e.target.value)}
          >
            <option value="">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {/* Sort Options */}
          <select
            className="input-field"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="title">Title (A-Z)</option>
            <option value="rating_desc">Highest Rated</option>
            <option value="rating_asc">Lowest Rated</option>
            <option value="most_rated">Most Rated</option>
          </select>

          {/* Active Genre Filter Display */}
          {filters.genre && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Genre:</span>
              <button
                onClick={() => handleFilterChange('genre', '')}
                className="px-3 py-1 rounded-full bg-primary text-white 
                         hover:bg-primary/80 transition-colors flex items-center gap-2"
              >
                {filters.genre}
                <span className="text-sm">×</span>
              </button>
            </div>
          )}

          {/* Clear Filters */}
          {(filters.year || filters.genre) && (
            <button
              className="btn-secondary"
              onClick={() => {
                setFilters({});
                setCurrentPage(1);
                setSortBy('title');
              }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>
      
      {/* Movie List and Pagination (unchanged) */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-400">Loading movies...</div>
        ) : movies.length === 0 ? (
          <div className="text-center text-gray-400">No movies found</div>
        ) : (
          <>
            <MovieList 
              movies={movies} 
              onGenreClick={handleGenreClick}
            />
            
            <div className="flex justify-center items-center space-x-4 mt-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded ${
                  currentPage === 1 
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary/80'
                }`}
              >
                Previous
              </button>
              
              <span className="text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded ${
                  currentPage === totalPages
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary/80'
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 