export interface Movie {
  movie_id: number;
  title: string;
  overview: string;
  posterPath: string;
  releaseDate: string;
  year?: string;
  voteAverage: number;
  genres: string[];
  supabaseRatingAverage: number | null;
  totalRatings: number;
}

export interface MovieDetails extends Movie {
  runtime: number;
  budget: number;
  revenue: number;
} 