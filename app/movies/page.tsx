'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Movie } from '../types/movie'
import MovieList from '../components/MovieList'
import { FiSearch, FiFilter, FiX } from 'react-icons/fi'
import CustomSelect from '../components/CustomSelect'

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
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-background-dark/5 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-background-dark/10 to-transparent animate-pulse-slow"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        
        <div className="relative container-wrapper">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="hero-text inline-block">
                Discover Movies
              </span>
            </h1>
            <p className="text-lg text-gray-300/90 mb-8">
              Find your next favorite film from our curated collection
            </p>

            {/* Search Bar */}
            <div className="flex gap-3">
              <div className="relative flex-grow group">
                <input 
                  type="text" 
                  placeholder="Search for a movie..." 
                  className="input-field pl-12 group-hover:pl-14 transition-all duration-300"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    if (e.target.value === '') handleSearch()
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-400 transition-all duration-300 group-hover:scale-110" />
              </div>
              <button 
                className="btn-primary group whitespace-nowrap"
                onClick={handleSearch}
              >
                Search
                <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Card */}
      <section className="container-wrapper -mt-8 relative z-10 mb-16">
        <div className="glass-card p-8 shadow-[0_8px_32px_rgba(0,0,0,0.24)]">
          <div className="space-y-8">
            {/* Filters Section */}
            <div className="space-y-6">
              {/* Year Range and Sort */}
              <div className="flex flex-wrap gap-6">
                {/* Year Range */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 block">Year Range</label>
                  <div className="flex items-center gap-2">
                    <CustomSelect
                      className="w-[120px]"
                      value={filters.yearFrom?.toString() || ''}
                      onChange={(value) => handleFilterChange('yearFrom', value)}
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
                      onChange={(value) => handleFilterChange('yearTo', value)}
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
                      { value: 'title', label: 'Title (A-Z)' },
                      { value: 'rating_desc', label: 'Highest Rated' },
                      { value: 'rating_asc', label: 'Lowest Rated' },
                      { value: 'most_rated', label: 'Most Rated' }
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
              {(filters.yearFrom || filters.yearTo || (filters.genres && filters.genres.length > 0)) && (
                <div className="flex flex-wrap items-center gap-2 pt-4">
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
                        <FiX className="w-4 h-4" />
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
                        <FiX className="w-4 h-4" />
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
                      setCurrentPage(1);
                      setSortBy('title');
                    }}
                  >
                    <FiFilter className="w-4 h-4" />
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Movie List Section */}
      <section className="container-wrapper py-16">
        {loading ? (
          <div className="text-center py-12 space-y-4">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-blue-400 border-t-transparent"></div>
            <p className="text-gray-400 animate-pulse">Loading movies...</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="text-6xl">🎬</div>
            <p className="text-xl text-gray-400">No movies found matching your criteria.</p>
            <p className="text-gray-500">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="space-y-12">
            <MovieList movies={movies} />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {/* Previous button */}
                {currentPage > 1 && (
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="glass-card px-4 py-2 text-blue-400 hover:bg-white/[0.03] transition-all duration-300 hover:scale-105 group"
                  >
                    <span className="inline-block transition-transform group-hover:-translate-x-1">←</span>
                    {" "}Prev
                  </button>
                )}

                {/* First page */}
                <button
                  onClick={() => setCurrentPage(1)}
                  className={`px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                    currentPage === 1
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'glass-card hover:bg-white/[0.03] text-blue-400'
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
                      className={`px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                          : 'glass-card hover:bg-white/[0.03] text-blue-400'
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
                    className={`px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                      currentPage === totalPages
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'glass-card hover:bg-white/[0.03] text-blue-400'
                    }`}
                  >
                    {totalPages}
                  </button>
                )}

                {/* Next button */}
                {currentPage < totalPages && (
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="glass-card px-4 py-2 text-blue-400 hover:bg-white/[0.03] transition-all duration-300 hover:scale-105 group"
                  >
                    Next{" "}
                    <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
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