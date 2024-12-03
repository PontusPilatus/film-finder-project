export interface Movie {
  id: string;
  title: string;
  overview: string;
  posterPath: string;
  releaseDate: string;
  voteAverage: number;
  genres: string;
  supabaseRatingAverage: number | null;
  totalRatings: number;
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