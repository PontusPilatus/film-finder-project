'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Movie {
  id: number
  title: string
  year?: number
  runtime?: string
  genres?: string
  description?: string
  rating?: number
}

export default function Movies() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchMovies()
  }, [])

  async function fetchMovies() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('title')

      if (error) {
        throw error
      }

      if (data) {
        setMovies(data)
      }
    } catch (error) {
      console.error('Error fetching movies:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .ilike('title', `%${searchQuery}%`)
        .order('title')

      if (error) {
        throw error
      }

      if (data) {
        setMovies(data)
      }
    } catch (error) {
      console.error('Error searching movies:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderGenres = (genresString?: string) => {
    if (!genresString) return null;
    
    const genres = genresString.split(',').map(genre => genre.trim());
    
    return (
      <span className="text-gray-400">
        {genres.map((genre, index) => (
          <span key={index}>
            {genre}
            {index < genres.length - 1 && (
              <span className="text-gray-600 mx-2"> | </span>
            )}
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Search Section */}
      <div className="card bg-gradient-to-r from-blue-900 to-blue-800 border-none">
        <h2 className="text-2xl font-bold mb-6 text-white">Discover Your Next Favorite Movie</h2>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Search for a movie..." 
            className="input-field flex-grow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            className="btn-primary"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>
      
      {/* Movie List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-400">Loading movies...</div>
        ) : movies.length === 0 ? (
          <div className="text-center text-gray-400">No movies found</div>
        ) : (
          movies.map((movie) => (
            <div key={movie.id} className="card hover:border-primary group transition-all duration-200">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-100 group-hover:text-primary transition-colors">
                    {movie.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm">
                    {movie.year && (
                      <>
                        <span className="text-gray-400">{movie.year}</span>
                        <span className="text-gray-600">•</span>
                      </>
                    )}
                    {movie.runtime && (
                      <>
                        <span className="text-gray-400">{movie.runtime}</span>
                        <span className="text-gray-600">•</span>
                      </>
                    )}
                    {renderGenres(movie.genres)}
                  </div>
                  {movie.description && (
                    <p className="text-gray-300 line-clamp-2 mt-2">
                      {movie.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {movie.rating && (
                    <div className="flex items-center">
                      <span className="text-yellow-500">
                        {'★'.repeat(Math.floor(movie.rating))}
                      </span>
                      <span className="text-gray-600">
                        {'★'.repeat(5 - Math.floor(movie.rating))}
                      </span>
                      <span className="text-gray-400 text-sm ml-2">
                        {movie.rating.toFixed(1)}/5.0
                      </span>
                    </div>
                  )}
                  <button className="btn-primary text-sm">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 