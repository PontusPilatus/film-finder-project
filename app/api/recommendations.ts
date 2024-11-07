import { NextApiRequest, NextApiResponse } from 'next'
import { recommendMovies } from '../../path/to/your/recommendation/model'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    try {
      const userIdNumber = parseInt(userId as string, 10)
      const [topRecommendations, bottomRecommendations] = await recommendMovies(userIdNumber)

      return res.status(200).json({ topRecommendations, bottomRecommendations })
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 