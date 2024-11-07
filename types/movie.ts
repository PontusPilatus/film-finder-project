export interface Movie {
  id: string;
  title: string;
  overview: string;
  posterPath: string;
  releaseDate: string;
  voteAverage: number;
}

export interface MovieDetails extends Movie {
  runtime: number;
  genres: string[];
  budget: number;
  revenue: number;
} 