import React, { useState, useEffect } from 'react';
import axiosInstance from '/app/src/utils/api';
interface Profile {
  id: number;
  origin: string;
  destination: string;
}

const ProfileList: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [trains, setTrains] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/profile/');
      setProfiles(response.data);
      console.log('Profiles fetched successfully:', response.data);
    } catch (error) {
      setError('Error fetching profiles');
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrains = async (origin: string, destination: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/train/train_recommendations/', {
        params: { origin, destination },
      });
      setTrains(response.data);
      console.log('Train recommendations fetched successfully:', response.data);
    } catch (error) {
      setError('Error fetching trains');
      console.error('Error fetching trains:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/profile/', {
        origin,
        destination,
      });
      setProfiles([...profiles, response.data]);
      setOrigin('');
      setDestination('');
      console.log('Profile created successfully:', response.data);
    } catch (error) {
      setError('Error creating profile');
      console.error('Error creating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.put(`/profile/${id}`, {
        origin,
        destination,
      });
      setProfiles(
        profiles.map((profile) => (profile.id === id ? response.data : profile))
      );
      setOrigin('');
      setDestination('');
      setEditingProfile(null);
      console.log('Profile updated successfully:', response.data);
    } catch (error) {
      setError('Error updating profile');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProfile = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.delete(`/profile/${id}`);
      setProfiles(profiles.filter((profile) => profile.id !== id));
      console.log('Profile deleted successfully');
    } catch (error) {
      setError('Error deleting profile');
      console.error('Error deleting profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (profile: Profile) => {
    setOrigin(profile.origin);
    setDestination(profile.destination);
    setEditingProfile(profile);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProfile) {
      updateProfile(editingProfile.id);
    } else {
      createProfile();
    }
  };

  return (
    <div>
      <h1>User Profiles</h1>
      <form onSubmit={handleSubmit}>
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
        <button type="submit" disabled={loading}>
          {editingProfile ? 'Update Profile' : 'Create Profile'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Loading...</p>}
      <ul>
        {profiles.map((profile) => (
          <li key={profile.id}>
            {profile.origin} to {profile.destination}
            <button onClick={() => handleEdit(profile)}>Edit</button>
            <button onClick={() => deleteProfile(profile.id)}>Delete</button>
            <button
              onClick={() => fetchTrains(profile.origin, profile.destination)}
            >
              Get Train Recommendations
            </button>
          </li>
        ))}
      </ul>
      <h2>Train Recommendations</h2>
      <ul>
        {trains.map((train, index) => (
          <li key={index}>
            {train.origin} to {train.destination} - Scheduled: {train.std} -
            Estimated: {train.etd}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfileList;
