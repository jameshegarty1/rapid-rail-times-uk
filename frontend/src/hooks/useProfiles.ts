import { useState, useEffect } from 'react';
import { fetchProfiles, fetchTrains, createProfile, updateProfile, deleteProfile } from '../utils/api';

interface Profile {
  id: number;
  origins: string[];
  destinations: string[];
}

interface Train {
  scheduled_departure: string;
  estimated_departure: string;
  destination: string;
}

interface UseProfilesReturn {
  profiles: Profile[];
  origins: string[];
  destinations: string[];
  trains: Train[];
  loading: boolean;
  error: string | null;
  editingProfile: Profile | null;
  setOrigins: React.Dispatch<React.SetStateAction<string[]>>;
  setDestinations: React.Dispatch<React.SetStateAction<string[]>>;
  setEditingProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  handleCreateProfile: (origins: string[], destinations: string[]) => Promise<void>;
  handleUpdateProfile: (id: number, origins: string[], destinations: string[]) => Promise<void>;
  handleDeleteProfile: (id: number) => Promise<void>;
  handleFetchTrains: (origins: string[], destinations: string[]) => Promise<void>;
  setTrains: React.Dispatch<React.SetStateAction<Train[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function useProfiles(): UseProfilesReturn {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [origins, setOrigins] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const loadProfiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProfiles();
        setProfiles(data);
      } catch (error) {
        setError('Error fetching profiles');
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, []);

  const handleCreateProfile = async (origins: string[], destinations: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const newProfile = await createProfile(origins, destinations);
      setProfiles([...profiles, newProfile]);
      setOrigins([]);
      setDestinations([]);
    } catch (error) {
      setError('Error creating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (id: number, origins: string[], destinations: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const updatedProfile = await updateProfile(id, origins, destinations);
      setProfiles(profiles.map((profile) => (profile.id === id ? updatedProfile : profile)));
      setOrigins([]);
      setDestinations([]);
      setEditingProfile(null);
    } catch (error) {
      setError('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await deleteProfile(id);
      setProfiles(profiles.filter((profile) => profile.id !== id));
    } catch (error) {
      setError('Error deleting profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchTrains = async (origins: string[], destinations: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const trainsData = await fetchTrains(origins, destinations);
      setTrains(trainsData);
    } catch (error) {
      setError('Error fetching trains');
    } finally {
      setLoading(false);
    }
  };

  return {
    profiles,
    origins,
    destinations,
    trains,
    loading,
    error,
    editingProfile,
    setOrigins,
    setDestinations,
    setEditingProfile,
    handleCreateProfile,
    handleUpdateProfile,
    handleDeleteProfile,
    handleFetchTrains,
    setTrains,
    setLoading,
    setError
  };
}

