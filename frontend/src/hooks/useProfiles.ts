import { useState, useEffect, useRef } from 'react';
import {
  fetchProfiles,
  fetchTrains,
  createProfile,
  updateProfile,
  deleteProfile,
} from '../utils/api';
import { Train, Profile } from '../utils/interfaces';
import useTrains from './useTrains';

interface UseProfilesReturn {
  profiles: Profile[];
  linkedTrainsData: { [profileId: number]: Train[] };
  loading: { [key: string]: boolean };
  error: string | null;
  expandedProfileId: number | null;
  setExpandedProfileId: React.Dispatch<React.SetStateAction<number | null>>;
  handleCreateProfile: (
    origins: string[],
    destinations: string[]
  ) => Promise<void>;
  handleUpdateProfile: (
    id: number,
    origins: string[],
    destinations: string[]
  ) => Promise<void>;
  handleDeleteProfile: (id: number) => Promise<void>;
  handleFetchTrains: (
    origins: string[],
    destinations: string[],
    profileId: number,
    forceFetch?: boolean
  ) => Promise<void>;
  lastFetchTime: { [profileId: number]: Date | null };
  favoriteProfileId: number | null;
  setFavoriteProfileId: (id: number | null) => void;
}

export default function useProfiles(): UseProfilesReturn {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [expandedProfileId, setExpandedProfileId] = useState<number | null>(
    null
  );
  const [favoriteProfileId, setFavoriteProfileId] = useState<number | null>(
    null
  );

  const {
    trainsData: linkedTrainsData,
    loading: trainsLoading,
    error: trainsError,
    lastFetchTime,
    fetchTrainsForRoute,
  } = useTrains();

  useEffect(() => {
    const loadProfiles = async () => {
      setLoading((prev) => ({ ...prev, global: true }));
      setError(null);
      try {
        const data = await fetchProfiles();
        setProfiles(data);

        // If we have a stored favorite ID, validate it still exists
        if (
          favoriteProfileId &&
          !data.find((p) => p.id === favoriteProfileId)
        ) {
          setFavoriteProfileId(null);
        }
      } catch (error) {
        setError('Error fetching profiles');
      } finally {
        setLoading((prev) => ({ ...prev, global: false }));
      }
    };

    loadProfiles();
  }, []);

  const handleCreateProfile = async (
    origins: string[],
    destinations: string[]
  ) => {
    setLoading((prev) => ({ ...prev, global: true }));
    setError(null);
    try {
      const newProfile = await createProfile(origins, destinations);
      setProfiles([...profiles, newProfile]);
    } catch (error) {
      setError('Error creating profile');
    } finally {
      setLoading((prev) => ({ ...prev, global: false }));
    }
  };

  const handleUpdateProfile = async (
    id: number,
    origins: string[],
    destinations: string[]
  ) => {
    setLoading((prev) => ({ ...prev, [id]: true }));
    setError(null);
    try {
      const updatedProfile = await updateProfile(id, origins, destinations);
      setProfiles(
        profiles.map((profile) =>
          profile.id === id ? updatedProfile : profile
        )
      );
    } catch (error) {
      setError('Error updating profile');
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDeleteProfile = async (id: number) => {
    setLoading((prev) => ({ ...prev, [id]: true }));
    setError(null);
    try {
      await deleteProfile(id);
      setProfiles(profiles.filter((profile) => profile.id !== id));
      if (favoriteProfileId === id) {
        setFavoriteProfileId(null);
      }
    } catch (error) {
      setError('Error deleting profile');
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Wrapper around fetchTrainsForRoute that converts profileId to string
  const handleFetchTrains = async (
    origins: string[],
    destinations: string[],
    profileId: number,
    forceFetch = false
  ) => {
    await fetchTrainsForRoute(
      origins,
      destinations,
      profileId.toString(),
      forceFetch
    );
  };

  const combinedLoading = {
    ...loading,
    ...trainsLoading,
  };

  const combinedError = error || trainsError;

  return {
    profiles,
    linkedTrainsData,
    loading: combinedLoading,
    error: combinedError,
    handleCreateProfile,
    handleUpdateProfile,
    handleDeleteProfile,
    handleFetchTrains,
    lastFetchTime,
    expandedProfileId,
    setExpandedProfileId,
    favoriteProfileId,
    setFavoriteProfileId,
  };
}
