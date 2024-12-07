import numpy as np
import pandas as pd
from pathlib import Path
import pickle
from typing import List, Dict, Optional
from ..config.settings import settings

class MovieRecommender:
    def __init__(self):
        self.load_model_components()
        self.load_data()

    def load_model_components(self):
        """Load SVD model components and mappings"""
        try:
            # Load model components
            self.P = np.load(settings.BASE_DIR / "model_P.npy")
            self.Q = np.load(settings.BASE_DIR / "model_Q.npy")
            self.bu = np.load(settings.BASE_DIR / "model_bu.npy")
            self.bi = np.load(settings.BASE_DIR / "model_bi.npy")
            self.mu = np.load(settings.BASE_DIR / "model_mu.npy")[0]
            
            # Load mappings
            with open(settings.BASE_DIR / "user_id_map.pkl", "rb") as f:
                self.user_id_map = pickle.load(f)
            with open(settings.BASE_DIR / "movie_id_map.pkl", "rb") as f:
                self.movie_id_map = pickle.load(f)
                
        except Exception as e:
            print(f"Error loading model components: {e}")
            raise

    def load_data(self):
        """Load movie and rating data"""
        try:
            self.movies_df = pd.read_csv(settings.PROCESSED_DATA_DIR / "filtered_movies.csv")
            self.ratings_df = pd.read_csv(settings.PROCESSED_DATA_DIR / "filtered_ratings.csv")
        except Exception as e:
            print(f"Error loading data: {e}")
            raise

    def predict_rating(self, user_idx: int, movie_idx: int) -> float:
        """Predict rating for a user-movie pair using SVD"""
        return self.mu + self.bu[user_idx] + self.bi[movie_idx] + \
               np.dot(self.P[user_idx], self.Q[movie_idx].T)

    def get_movie_details(self, movie_id: int) -> Optional[Dict]:
        """Get movie details from the movies dataframe"""
        movie = self.movies_df[self.movies_df["movieId"] == movie_id]
        if movie.empty:
            return None
            
        movie = movie.iloc[0]
        return {
            "movie_id": int(movie_id),
            "title": movie["title"],
            "overview": movie.get("overview", ""),
            "poster_path": movie.get("poster_path", ""),
            "release_date": str(movie.get("release_date", "")),
            "genres": movie["genres"].split("|") if movie.get("genres") else [],
            "average_rating": float(movie.get("average_rating", 0)),
            "total_ratings": int(movie.get("total_ratings", 0))
        }

    def get_recommendations(self, user_id: int, n: int = 10) -> List[Dict]:
        """Get movie recommendations for a user"""
        try:
            if user_id not in self.user_id_map:
                return []
            
            user_idx = self.user_id_map[user_id]
            
            # Get user's rated movies
            user_ratings = self.ratings_df[self.ratings_df["userId"] == user_id]
            rated_movie_ids = set(user_ratings["movieId"])
            
            # Get unrated movies
            all_movie_ids = set(self.movie_id_map.keys())
            unrated_movie_ids = list(all_movie_ids - rated_movie_ids)
            
            if not unrated_movie_ids:
                return []
            
            # Generate predictions
            predictions = []
            for movie_id in unrated_movie_ids:
                movie_idx = self.movie_id_map[movie_id]
                score = self.predict_rating(user_idx, movie_idx)
                movie_details = self.get_movie_details(movie_id)
                if movie_details:
                    movie_details["score"] = float(score)
                    predictions.append(movie_details)
            
            # Sort by score and get top N
            predictions.sort(key=lambda x: x["score"], reverse=True)
            return predictions[:n]
            
        except Exception as e:
            print(f"Error generating recommendations: {e}")
            return []

# Create singleton instance
recommender = MovieRecommender() 