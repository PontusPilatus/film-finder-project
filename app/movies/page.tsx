'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Movie } from '../../types/movie'
import MovieList from '../components/MovieList'
import { FiSearch, FiFilter, FiX } from 'react-icons/fi'

const MOVIES_PER_PAGE = 10;

interface Filters {
  yearFrom?: number;
  yearTo?: number;
  genres?: string[];
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

    // Get genres from URL parameters when page loads
    const urlParams = new URLSearchParams(window.location.search);
    const genresParam = urlParams.get('genres');
    const sortByParam = urlParams.get('sortBy') as SortOption;
    
    if (genresParam) {
      const genresList = genresParam.split(',');
      setFilters(prev => ({
        ...prev,
        genres: genresList
      }));
    }

    if (sortByParam) {
      setSortBy(sortByParam);
    }
  }, []); // Run once when component mounts

  useEffect(() => {
    if (!availableGenres.length) return; // Don't fetch until we have genres loaded
    fetchMovies();
  }, [currentPage, filters, sortBy, searchQuery, availableGenres]);

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
      if (filters.yearFrom) {
        query = query.gte('year', filters.yearFrom);
      }
      if (filters.yearTo) {
        query = query.lte('year', filters.yearTo);
      }
      
      // Modified genre filtering to require ALL selected genres
      if (filters.genres && filters.genres.length > 0) {
        // Use .and() to ensure ALL conditions are met
        filters.genres.forEach(genre => {
          query = query.ilike('genres', `%${genre}%`);
        });
      }

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data: movies, error } = await query;
      console.log('Query results:', movies?.length, 'movies found');

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

  const totalPages = Math.ceil(totalCount / MOVIES_PER_PAGE)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pb-12 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-background-dark/5 to-transparent"></div>
        
        <div className="relative container-wrapper">
          <div className="grid lg:grid-cols-1 gap-8 lg:gap-12 items-center pt-8 sm:pt-12 md:pt-16">
            <div className="space-y-6 text-center fade-in-up">
              <div className="space-y-3">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-100">
                  Discover Movies
                </h1>
                <p className="text-lg text-gray-300">
                  Find your next favorite film from our curated collection
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters Card */}
      <section className="container-wrapper py-16">
        <div className="card bg-[var(--background-card)] backdrop-blur-md border-white/10">
          <div className="space-y-8">
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

            {/* Filters Section */}
            <div className="space-y-6">
              {/* Year Range and Sort */}
              <div className="flex flex-wrap gap-6">
                {/* Year Range */}
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Year Range</label>
                  <div className="flex items-center gap-2">
                    <select
                      className="bg-[var(--background-dark)] border border-white/10 rounded-lg px-4 py-2.5 
                               text-gray-200 w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500/40
                               hover:border-white/20 transition-colors appearance-none cursor-pointer
                               bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01Ljk5OTg5IDQuOTc2NzFMMTAuMTk1OSAwLjc4MDc2MUwxMS42MDk5IDIuMTk0NzZMNS45OTk4OSA3LjgwNDc2TDAuMzg5ODkzIDIuMTk0NzZMMS44MDM4OSAwLjc4MDc2MUw1Ljk5OTg5IDQuOTc2NzFaIiBmaWxsPSIjOTRBM0I4Ii8+Cjwvc3ZnPgo=')] 
                               bg-[length:12px_12px] bg-[right_16px_center] bg-no-repeat"
                      value={filters.yearFrom || ''}
                      onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
                    >
                      <option value="">From</option>
                      {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>

                    <span className="text-gray-400">-</span>

                    <select
                      className="bg-[var(--background-dark)] border border-white/10 rounded-lg px-4 py-2.5 
                               text-gray-200 w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500/40
                               hover:border-white/20 transition-colors appearance-none cursor-pointer
                               bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01Ljk5OTg5IDQuOTc2NzFMMTAuMTk1OSAwLjc4MDc2MUwxMS42MDk5IDIuMTk0NzZMNS45OTk4OSA3LjgwNDc2TDAuMzg5ODkzIDIuMTk0NzZMMS44MDM4OSAwLjc4MDc2MUw1Ljk5OTg5IDQuOTc2NzFaIiBmaWxsPSIjOTRBM0I4Ii8+Cjwvc3ZnPgo=')] 
                               bg-[length:12px_12px] bg-[right_16px_center] bg-no-repeat"
                      value={filters.yearTo || ''}
                      onChange={(e) => handleFilterChange('yearTo', e.target.value)}
                    >
                      <option value="">To</option>
                      {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Sort By</label>
                  <select
                    className="bg-[var(--background-dark)] border border-white/10 rounded-lg px-4 py-2.5 
                             text-gray-200 w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500/40
                             hover:border-white/20 transition-colors appearance-none cursor-pointer
                             bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01Ljk5OTg5IDQuOTc2NzFMMTAuMTk1OSAwLjc4MDc2MUwxMS42MDk5IDIuMTk0NzZMNS45OTk4OSA3LjgwNDc2TDAuMzg5ODkzIDIuMTk0NzZMMS44MDM4OSAwLjc4MDc2MUw1Ljk5OTg5IDQuOTc2NzFaIiBmaWxsPSIjOTRBM0I4Ii8+Cjwvc3ZnPgo=')] 
                             bg-[length:12px_12px] bg-[right_16px_center] bg-no-repeat"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                  >
                    <option value="title">Title (A-Z)</option>
                    <option value="rating_desc">Highest Rated</option>
                    <option value="rating_asc">Lowest Rated</option>
                    <option value="most_rated">Most Rated</option>
                  </select>
                </div>
              </div>

              {/* Genre Tags */}
              <div>
                <label className="text-sm text-gray-400 block mb-2">Genres (select multiple)</label>
                <div className="flex flex-wrap gap-2">
                  {availableGenres.map(genre => (
                    <button
                      key={genre}
                      onClick={() => handleGenreClick(genre)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        filters.genres?.includes(genre)
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Filters */}
              {(filters.yearFrom || filters.yearTo || (filters.genres && filters.genres.length > 0)) && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {/* Show active year range filter */}
                  {(filters.yearFrom || filters.yearTo) && (
                    <span className="px-3 py-1.5 rounded-full bg-blue-500 text-white 
                                   flex items-center gap-2 text-sm">
                      Year: {filters.yearFrom || 'Any'} - {filters.yearTo || 'Any'}
                      <button
                        onClick={() => {
                          handleFilterChange('yearFrom', '');
                          handleFilterChange('yearTo', '');
                        }}
                        className="hover:text-blue-200 transition-colors"
                      >
                        <FiX />
                      </button>
                    </span>
                  )}

                  {/* Show active genre filters */}
                  {filters.genres?.map(genre => (
                    <span
                      key={genre}
                      className="px-3 py-1.5 rounded-full bg-blue-500 text-white 
                               flex items-center gap-2 text-sm"
                    >
                      {genre}
                      <button
                        onClick={() => handleGenreClick(genre)}
                        className="hover:text-blue-200 transition-colors"
                      >
                        <FiX />
                      </button>
                    </span>
                  ))}

                  {/* Clear all filters button */}
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
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Movie List Section */}
      <section className="container-wrapper mb-16">
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
                {/* Previous button */}
                {currentPage > 1 && (
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                  >
                    Previous
                  </button>
                )}

                {/* First page */}
                <button
                  onClick={() => setCurrentPage(1)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                  }`}
                >
                  1
                </button>

                {/* Left ellipsis */}
                {currentPage > 3 && <span className="px-4 py-2 text-gray-400">...</span>}

                {/* Pages around current page */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => page !== 1 && page !== totalPages && Math.abs(currentPage - page) <= 1)
                  .map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                {/* Right ellipsis */}
                {currentPage < totalPages - 2 && <span className="px-4 py-2 text-gray-400">...</span>}

                {/* Last page */}
                {totalPages > 1 && (
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === totalPages
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                    }`}
                  >
                    {totalPages}
                  </button>
                )}

                {/* Next button */}
                {currentPage < totalPages && (
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                  >
                    Next
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
} 