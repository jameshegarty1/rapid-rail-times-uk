import { useState, useEffect, useRef } from 'react';
import { fetchProfiles, fetchTrains, createProfile, updateProfile, deleteProfile } from '../utils/api';
import { fetchTrains as fetchTrainsApi } from '../utils/api';
import { Train, Profile } from '../utils/interfaces'

interface LinkedTrainData {
  [profileId: number]: Train[];
}

interface MemoizedData {
  trains: Train[];
  lastFetchTime: Date;
}

interface UseProfilesReturn {
  profiles: Profile[];
  origins: string[];
  destinations: string[];
  linkedTrainsData: { [profileId: number]: Train[] };
  loading: boolean;
  error: string | null;
  editingProfile: Profile | null;
  setOrigins: React.Dispatch<React.SetStateAction<string[]>>;
  setDestinations: React.Dispatch<React.SetStateAction<string[]>>;
  setEditingProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  handleCreateProfile: (origins: string[], destinations: string[]) => Promise<void>;
  handleUpdateProfile: (id: number, origins: string[], destinations: string[]) => Promise<void>;
  handleDeleteProfile: (id: number) => Promise<void>;
  handleFetchTrains: (origins: string[], destinations: string[], profileId: number, forceFetch?: boolean) => Promise<void>;
  setLinkedTrainsData: React.Dispatch<React.SetStateAction<{ [profileId: number]: Train[] }>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  lastFetchTime: { [profileId: number]: Date | null };
  setLastFetchTime: React.Dispatch<React.SetStateAction<{ [profileId: number]: Date | null }>>;
}

export default function useProfiles(): UseProfilesReturn {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [origins, setOrigins] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [linkedTrainsData, setLinkedTrainsData] = useState<LinkedTrainData>({});
  const [lastFetchTime, setLastFetchTime] = useState<{ [profileId: number]: Date | null }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const memoizedTrains = useRef<{ [key: string]: MemoizedData }>({});

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

  const handleFetchTrains = async (origins: string[], destinations: string[], profileId: number, forceFetch = false) => {
    const cacheKey = `${origins.join('-')}_${destinations.join('-')}`;
    if (!forceFetch && memoizedTrains.current[cacheKey]) {
      console.log('Returning cached data');
      const cachedData = memoizedTrains.current[cacheKey];
      setLinkedTrainsData(prevState => ({ ...prevState, [profileId]: cachedData.trains }));
      setLastFetchTime(prevState => ({ ...prevState, [profileId]: new Date(cachedData.lastFetchTime) }));
    } else {
      console.log('Fetching new data');
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTrainsApi(origins, destinations, forceFetch);
        const fetchTime = new Date();
        memoizedTrains.current[cacheKey] = { trains: data, lastFetchTime: fetchTime };
        console.log("Got data. Adding to cache.")
        setLinkedTrainsData(prevState => ({ ...prevState, [profileId]: data }));
        setLastFetchTime(prevState => ({ ...prevState, [profileId]: fetchTime }));
        setLoading(false);
      } catch (error) {
        setError('Error fetching trains');
        setLoading(false);
      }
    }
  };

  return {
    profiles,
    origins,
    destinations,
    linkedTrainsData,
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
    setLinkedTrainsData,
    setLoading,
    setError,
    lastFetchTime,
    setLastFetchTime
  };
}

