'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { FiChevronRight, FiCheck } from 'react-icons/fi'
import MovieRatingCard from '../components/MovieRatingCard'
import { Movie } from '../../types/movie'

type OnboardingStep = 'genres' | 'movies' | 'decades' | 'complete'

export default function Onboarding() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('genres')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedDecades, setSelectedDecades] = useState<number[]>([])
  const [ratedMovies, setRatedMovies] = useState<{[key: string]: number}>({})
  const [popularMovies, setPopularMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentStep === 'movies') {
      fetchPopularMovies()
    }
  }, [currentStep])

  const fetchPopularMovies = async () => {
    setLoading(true)
    try {
      // Get total count of movies first
      const { count } = await supabase
        .from('movies')
        .select('*', { count: 'exact', head: true })

      if (!count) return

      // Calculate random offset
      const randomOffset = Math.floor(Math.random() * (count - 12))

      // Get random selection of movies
      const { data: movies, error } = await supabase
        .from('movies')
        .select('movie_id, title, year')
        .range(randomOffset, randomOffset + 11)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      if (movies) {
        console.log('Raw movies data:', movies)
        const transformedMovies = movies.map(movie => ({
          id: movie.movie_id.toString(),
          movie_id: movie.movie_id,
          title: movie.title,
          overview: '',
          posterPath: '',
          releaseDate: movie.year?.toString() || '',
          voteAverage: 0,
          genres: '',
          year: movie.year?.toString() || ''
        }))
        console.log('Transformed movies:', transformedMovies)
        setPopularMovies(transformedMovies)
      }
    } catch (error) {
      console.error('Error fetching popular movies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenreSelect = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  const handleDecadeSelect = (decade: number) => {
    setSelectedDecades(prev =>
      prev.includes(decade)
        ? prev.filter(d => d !== decade)
        : [...prev, decade]
    )
  }

  const handleMovieRate = (movieId: string, rating: number) => {
    setRatedMovies(prev => ({
      ...prev,
      [movieId]: rating
    }))
  }

  const handleNext = async () => {
    switch (currentStep) {
      case 'genres':
        if (selectedGenres.length > 0) {
          setCurrentStep('movies')
        }
        break
      case 'movies':
        if (Object.keys(ratedMovies).length >= 5) {
          setCurrentStep('decades')
        }
        break
      case 'decades':
        if (selectedDecades.length > 0) {
          await savePreferences()
          setCurrentStep('complete')
        }
        break
      case 'complete':
        router.push('/movies')
        break
    }
  }

  const savePreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      // Save user preferences
      const { error: prefError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          favorite_genres: selectedGenres,
          preferred_decades: selectedDecades,
          onboarding_completed: true
        }, {
          onConflict: 'user_id'
        })

      if (prefError) throw prefError

      // Save ratings one by one
      for (const [movieId, rating] of Object.entries(ratedMovies)) {
        try {
          const { error } = await supabase
            .from('ratings')
            .upsert({
              user_id: user.id,
              movie_id: movieId,  // Keep as string, Supabase will handle the conversion
              rating: rating
            }, {
              onConflict: ['user_id', 'movie_id']
            })

          if (error) {
            console.error('Failed to save rating:', error)
          }
        } catch (error) {
          console.error('Error saving rating:', error)
        }
      }
    } catch (error) {
      console.error('Error in savePreferences:', error)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'genres':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-100">
                What kind of movies do you enjoy?
              </h2>
              <p className="text-gray-400 text-lg">
                Select your favorite genres to help us recommend movies you'll love
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 
                'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 
                'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
              ].map(genre => (
                <button
                  key={genre}
                  onClick={() => handleGenreSelect(genre)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedGenres.includes(genre)
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        )

      case 'movies':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-100">
                Rate some popular movies
              </h2>
              <p className="text-gray-400 text-lg">
                This helps us understand your taste better
                <span className="block text-sm mt-1">
                  ({Object.keys(ratedMovies).length} of 5 movies rated)
                </span>
              </p>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-blue-400 border-t-transparent"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {popularMovies.map(movie => (
                    <MovieRatingCard
                      key={movie.movie_id}
                      movieId={movie.movie_id.toString()}
                      title={movie.title}
                      year={movie.year?.toString() || ''}
                      onRate={(rating) => handleMovieRate(movie.movie_id.toString(), rating)}
                      currentRating={ratedMovies[movie.movie_id.toString()]}
                    />
                  ))}
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={fetchPopularMovies}
                    className="btn-secondary flex items-center gap-2"
                    disabled={loading}
                  >
                    Show Different Movies
                    {loading && (
                      <div className="animate-spin rounded-full h-4 w-4 border border-current border-t-transparent" />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )

      case 'decades':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-100">
                Which movie eras interest you?
              </h2>
              <p className="text-gray-400 text-lg">
                Choose any time periods that catch your interest
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {[
                { label: '1950-1969', value: 1950 },
                { label: '1970-1989', value: 1970 },
                { label: '1990-2009', value: 1990 },
                { label: '2010+', value: 2010 }
              ].map(era => (
                <button
                  key={era.value}
                  onClick={() => handleDecadeSelect(era.value)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedDecades.includes(era.value)
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                  }`}
                >
                  {era.label}
                </button>
              ))}
            </div>
          </div>
        )

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
              <FiCheck className="w-8 h-8 text-blue-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-100">
                All set!
              </h2>
              <p className="text-gray-400">
                We'll use your preferences to recommend movies you'll love
              </p>
            </div>
          </div>
        )
    }
  }

  // Add this function to test the connection
  const testRatingConnection = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      // Try a simple insert
      const { data, error } = await supabase
        .from('ratings')
        .insert({
          user_id: user.id,
          movie_id: 1,  // Test with a simple ID
          rating: 5
        })
        .select()

      console.log('Test rating result:', { data, error })
    } catch (error) {
      console.error('Test rating error:', error)
    }
  }

  // Add this to your component to test
  useEffect(() => {
    testRatingConnection()
  }, [])

  return (
    <div className="min-h-screen bg-[var(--background-dark)]">
      <div className="container-wrapper py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8 md:mb-12">
            <div className="flex justify-between mb-3">
              {['Genres', 'Rate Movies', 'Decades', 'Complete'].map((step, index) => (
                <div
                  key={step}
                  className={`text-sm font-medium ${
                    ['genres', 'movies', 'decades', 'complete'][index] === currentStep
                      ? 'text-blue-400'
                      : 'text-gray-500'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
            <div className="h-1.5 bg-blue-500/10 rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    currentStep === 'genres' ? '25%' :
                    currentStep === 'movies' ? '50%' :
                    currentStep === 'decades' ? '75%' :
                    '100%'
                  }`
                }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="card backdrop-blur-lg border border-white/5 p-6 md:p-8">
            {renderStep()}

            {/* Navigation */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 'genres' && selectedGenres.length === 0) ||
                  (currentStep === 'movies' && Object.keys(ratedMovies).length < 5) ||
                  (currentStep === 'decades' && selectedDecades.length === 0)
                }
                className="btn-primary flex items-center gap-2 px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStep === 'complete' ? 'Get Started' : 'Next'}
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 