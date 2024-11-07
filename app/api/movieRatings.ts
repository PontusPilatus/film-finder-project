import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RatingStats {
  movie_id: string;
  average_rating: number;
  total_ratings: number;
}

export async function getMovieRatings(movieIds: string[]) {
  const { data: ratingsData, error: ratingsError } = await supabase
    .from('ratings')
    .select('movie_id, rating')
    .in('movie_id', movieIds.map(id => parseInt(id)));

  if (ratingsError) {
    throw ratingsError;
  }

  if (!ratingsData) {
    return [];
  }

  // Group and calculate averages
  const ratingsByMovie = ratingsData.reduce((acc: { [key: string]: { sum: number; count: number } }, rating) => {
    const movieId = rating.movie_id.toString();
    if (!acc[movieId]) {
      acc[movieId] = { sum: 0, count: 0 };
    }
    acc[movieId].sum += rating.rating;
    acc[movieId].count += 1;
    return acc;
  }, {});

  // Calculate averages
  return Object.entries(ratingsByMovie).map(([movieId, { sum, count }]) => ({
    movieId,
    supabaseRatingAverage: count > 0 ? Math.round((sum / count) * 10) / 10 : null,
    totalRatings: count
  }));
} 