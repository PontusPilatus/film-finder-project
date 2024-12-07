from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ...models.recommender import recommender
from ...schemas.movie import RecommendationResponse
from ...config.settings import settings

router = APIRouter()

@router.get("/{user_id}", response_model=RecommendationResponse)
async def get_recommendations(
    user_id: int,
    limit: Optional[int] = Query(
        default=settings.DEFAULT_RECOMMENDATIONS_LIMIT,
        ge=1,
        le=50,
        description="Number of recommendations to return"
    )
):
    """
    Get movie recommendations for a user.
    
    - **user_id**: The ID of the user to get recommendations for
    - **limit**: Number of recommendations to return (default: 10, max: 50)
    """
    try:
        recommendations = recommender.get_recommendations(user_id, limit)
        
        if not recommendations:
            return RecommendationResponse(
                recommendations=[],
                method="svd"
            )
            
        return RecommendationResponse(
            recommendations=recommendations,
            method="svd"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating recommendations: {str(e)}"
        ) 