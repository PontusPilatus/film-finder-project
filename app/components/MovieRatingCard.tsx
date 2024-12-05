'use client'
import { useState } from 'react'
import { FiStar } from 'react-icons/fi'

interface MovieRatingCardProps {
  movieId: string
  title: string
  year: string
  onRate: (rating: number) => void
  currentRating?: number
}

export default function MovieRatingCard({
  movieId,
  title,
  year,
  onRate,
  currentRating
}: MovieRatingCardProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)

  return (
    <div className="card p-4 hover:bg-white/5 transition-colors group">
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-gray-100 text-lg">
            {title} <span className="text-gray-400">({year})</span>
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onMouseEnter={() => setHoveredRating(rating)}
              onMouseLeave={() => setHoveredRating(null)}
              onClick={() => onRate(rating)}
              className="p-1.5 -ml-0.5 rounded-full hover:bg-white/5 transition-colors"
            >
              <FiStar
                className={`w-6 h-6 transition-colors ${
                  (hoveredRating !== null ? rating <= hoveredRating : rating <= (currentRating || 0))
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-500 group-hover:text-gray-400'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-400">
            {currentRating ? `${currentRating} stars` : 'Rate this movie'}
          </span>
        </div>
      </div>
    </div>
  )
} 