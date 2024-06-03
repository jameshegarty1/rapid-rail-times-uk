import React, { useState } from 'react';
import axios from 'axios';

interface TrainRecommendation {
  origin: string;
  destination: string;
  std: string;
  etd: string;
}

const TrainRecommendations: React.FC = () => {
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [recommendations, setRecommendations] = useState<TrainRecommendation[]>(
    []
  );

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get('/api/v1/train/train_recommendations', {
        params: { origin, destination },
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching train recommendations:', error);
    }
  };

  return (
    <div>
      <h1>Train Recommendations</h1>
      <input
        type="text"
        value={origin}
        onChange={(e) => setOrigin(e.target.value)}
        placeholder="Origin"
      />
      <input
        type="text"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        placeholder="Destination"
      />
      <button onClick={fetchRecommendations}>Get Recommendations</button>
      <ul>
        {recommendations.map((recommendation, index) => (
          <li key={index}>
            {recommendation.origin} to {recommendation.destination} - Scheduled:{' '}
            {recommendation.std} - Estimated: {recommendation.etd}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrainRecommendations;
