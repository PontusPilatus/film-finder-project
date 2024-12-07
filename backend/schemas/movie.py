from pydantic import BaseModel, Field
from typing import List, Optional

class MovieBase(BaseModel):
    title: str
    overview: Optional[str] = None
    poster_path: Optional[str] = None
    release_date: Optional[str] = None
    genres: List[str] = Field(default_factory=list)

class MovieRecommendation(MovieBase):
    movie_id: int
    score: float = Field(..., description="Recommendation score between 0 and 5")
    average_rating: Optional[float] = Field(None, description="Average user rating")
    total_ratings: int = Field(default=0, description="Number of user ratings")

class RecommendationResponse(BaseModel):
    recommendations: List[MovieRecommendation]
    method: str = Field(..., description="Method used for recommendations (e.g., 'svd', 'popularity')") 