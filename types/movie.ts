export interface Movie {
  id: string;
  title: string;
  overview: string;
  posterPath: string;
  releaseDate: string;
  voteAverage: number;
  supabaseRatingAverage?: number | null;
  totalRatings?: number;
  genres?: string;
}

export interface MovieDetails {
  id: string;
  title: string;
  overview: string;
  posterPath: string;
  releaseDate: string;
  voteAverage: number;
  runtime: number;
  genres: string[];
  budget: number;
  revenue: number;
  supabaseRatingAverage?: number | null;
  totalRatings?: number;
} 