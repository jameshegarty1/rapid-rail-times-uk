import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Profile {
  id: number;
  origin: string;
  destination: string;
}

const Profile: React.FC = () => {
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await axios.get('/api/v1/profile/');
      setProfiles(response.data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const createProfile = async () => {
    try {
      const response = await axios.post('/api/v1/profile/', {
        origin,
        destination,
      });
      setProfiles([...profiles, response.data]);
      setOrigin('');
      setDestination('');
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  return (
    <div>
      <h1>Create Profile</h1>
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
      <button onClick={createProfile}>Create Profile</button>
      <h2>Profiles</h2>
      <ul>
        {profiles.map((profile) => (
          <li key={profile.id}>
            {profile.origin} to {profile.destination}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Profile;
