import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// Update the movie selection query to match the actual database schema
const MOVIE_QUERY = `
  movie_id,
  title,
  genres,
  ratings (
    rating
  ),
  genre_count
`;

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Validate user ID
    const userId = parseInt(params.userId);
    if (isNaN(userId)) {
      console.error('Invalid user ID:', params.userId);
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    console.log('Fetching ratings for user:', userId);
    
    // Get user's ratings
    const { data: userRatings, error: ratingsError } = await supabase
      .from('ratings')
      .select('movie_id, rating')
      .eq('user_id', userId);

    if (ratingsError) {
      console.error('Error fetching ratings:', ratingsError);
      return NextResponse.json(
        { error: 'Database error', details: ratingsError.message },
        { status: 500 }
      );
    }

    console.log(`Found ${userRatings?.length || 0} ratings for user ${userId}`);

    // For new users or users with no ratings, return popular movies
    if (!userRatings || userRatings.length === 0) {
      console.log('No ratings found, fetching popular movies');
      
      const { data: movies, error: moviesError } = await supabase
        .from('movies')
        .select(MOVIE_QUERY);

      if (moviesError) {
        console.error('Error fetching movies:', moviesError);
        return NextResponse.json(
          { error: 'Database error', details: moviesError.message },
          { status: 500 }
        );
      }

      // Calculate popularity scores with ratings info
      const moviesWithScores = movies?.map(movie => {
        const ratings = movie.ratings || [];
        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0
          ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / totalRatings
          : 0;
        
        const score = (totalRatings * 0.5) + (averageRating * 0.3) + ((movie.genre_count || 0) * 0.2);
        
        return {
          title: movie.title,
          score: Number(score.toFixed(2)),
          movieId: movie.movie_id,
          averageRating,
          totalRatings,
          genres: movie.genres?.split('|').map((g: string) => g.trim()) || []
        };
      }) || [];

      // Sort and return top recommendations
      const recommendations = moviesWithScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      return NextResponse.json({
        recommendations,
        message: 'Popular movies (rate some movies to get personalized recommendations)'
      });
    }

    // For users with ratings, get personalized recommendations
    const { data: movies, error: moviesError } = await supabase
      .from('movies')
      .select(MOVIE_QUERY);

    if (moviesError) {
      console.error('Error fetching movies:', moviesError);
      return NextResponse.json(
        { error: 'Database error', details: moviesError.message },
        { status: 500 }
      );
    }

    const userAvgRating = userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length;
    const ratedMovieIds = new Set(userRatings.map(r => r.movie_id));

    // Generate recommendations with ratings info
    const recommendations = movies
      ?.filter(movie => !ratedMovieIds.has(movie.movie_id))
      .map(movie => {
        const ratings = movie.ratings || [];
        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0
          ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / totalRatings
          : userAvgRating;

        const score = averageRating + (userAvgRating - 3.5) * 0.1;

        return {
          title: movie.title,
          score: Number(score.toFixed(2)),
          movieId: movie.movie_id,
          averageRating,
          totalRatings,
          genres: movie.genres?.split('|').map((g: string) => g.trim()) || []
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return NextResponse.json({ recommendations });
    
  } catch (error) {
    console.error('Unexpected error in API route:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 