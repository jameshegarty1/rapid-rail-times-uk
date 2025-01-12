import { useState, useEffect } from 'react';
import {
  fetchProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  setFavouriteProfile,
  unsetFavouriteProfile,
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
  handleFavouriteProfile: (id: number, is_set: boolean) => Promise<void>;
  lastFetchTime: { [profileId: number]: Date | null };
  favouriteProfileId: number | null;
  setFavouriteProfileId: (id: number | null) => void;
}

export default function useProfiles(): UseProfilesReturn {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [expandedProfileId, setExpandedProfileId] = useState<number | null>(
    null
  );
  const [favouriteProfileId, setFavouriteProfileId] = useState<number | null>(
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
        console.log('Profiles before setting state:', data);
        setProfiles(data);
        console.log('Profiles after setting state:', data.map(p => ({...p})));

        const favouriteProfile = data.find(p => p.favourite);
        console.log('Found favourite profile:', favouriteProfile);

        if (favouriteProfile) {
          setFavouriteProfileId(favouriteProfile.id);
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
      if (favouriteProfileId === id) {
        setFavouriteProfileId(null);
      }
    } catch (error) {
      setError('Error deleting profile');
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleFavouriteProfile = async (
    id: number,
    is_set: boolean = false
  ) => {
    setLoading((prev) => ({ ...prev, [id]: true }));
    setError(null);

    setProfiles(prevProfiles =>
        prevProfiles.map(profile => ({
          ...profile,
          favourite: profile.id === id ? is_set : false
        }))
    );
    setFavouriteProfileId(is_set ? id : null);

    try {
      const success = is_set
        ? await setFavouriteProfile(id)
        : await unsetFavouriteProfile(id);

      if (!success) {
        // Revert the UI state if the API call failed
        setProfiles(prevProfiles =>
            prevProfiles.map(profile => ({
              ...profile,
              favourite: profile.id === id ? !is_set : false
            }))
        );
        setFavouriteProfileId(is_set ? null : id);
      }

    } catch (error) {
      // Revert the UI state on error
      setProfiles(prevProfiles =>
          prevProfiles.map(profile => ({
            ...profile,
            favourite: profile.id === id ? !is_set : false
          }))
      );
      setFavouriteProfileId(is_set ? null : id);

      setError(
          error instanceof Error
              ? error.message
              : 'Error setting favourite profile'
      );
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
    handleFavouriteProfile,
    lastFetchTime,
    expandedProfileId,
    setExpandedProfileId,
    favouriteProfileId,
    setFavouriteProfileId,
  };
}
