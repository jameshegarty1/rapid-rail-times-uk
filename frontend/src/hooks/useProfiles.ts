import { useState, useEffect, useRef } from 'react';
import { fetchProfiles, fetchTrains, createProfile, updateProfile, deleteProfile } from '../utils/api';
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
    loading: { [key: string]: boolean };
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
    setLoading: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
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
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
    const [error, setError] = useState<string | null>(null);
    const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

    const memoizedTrains = useRef<{ [key: string]: MemoizedData }>({});

    useEffect(() => {
        const loadProfiles = async () => {
            setLoading((prev) => ({ ...prev, global: true }));
            setError(null);
            try {
                const data = await fetchProfiles();
                setProfiles(data);
            } catch (error) {
                setError('Error fetching profiles');
            } finally {
                setLoading((prev) => ({ ...prev, global: false }));
            }
        };

        loadProfiles();
    }, []);

    const handleCreateProfile = async (origins: string[], destinations: string[]) => {
        setLoading((prev) => ({ ...prev, global: true }));
        setError(null);
        try {
            const newProfile = await createProfile(origins, destinations);
            setProfiles([...profiles, newProfile]);
            setOrigins([]);
            setDestinations([]);
        } catch (error) {
            setError('Error creating profile');
        } finally {
            setLoading((prev) => ({ ...prev, global: false }));
        }
    };

    const handleUpdateProfile = async (id: number, origins: string[], destinations: string[]) => {
        setLoading((prev) => ({ ...prev, [id]: true }));
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
            setLoading((prev) => ({ ...prev, [id]: false }));
        }
    };

    const handleDeleteProfile = async (id: number) => {
        setLoading((prev) => ({ ...prev, [id]: true }));
        setError(null);
        try {
            await deleteProfile(id);
            setProfiles(profiles.filter((profile) => profile.id !== id));
        } catch (error) {
            setError('Error deleting profile');
        } finally {
            setLoading((prev) => ({ ...prev, [id]: false }));
        }
    };

    const handleFetchTrains = async (origins: string[], destinations: string[], profileId: number, forceFetch = false) => {
        const cacheKey = `${origins.join('-')}_${destinations.join('-')}`;

        // Check local cache first
        if (!forceFetch && memoizedTrains.current[cacheKey]) {
            console.log('Returning cached data');
            const cachedData = memoizedTrains.current[cacheKey];
            setLinkedTrainsData(prevState => ({ ...prevState, [profileId]: cachedData.trains }));
            setLastFetchTime(prevState => ({ ...prevState, [profileId]: new Date(cachedData.lastFetchTime) }));
        } else {
            console.log('Fetching new data');
            setLoading((prev) => ({ ...prev, [profileId]: true }));
            setError(null);
            try {
                // Start polling for results
                const data = await fetchTrains(origins, destinations, forceFetch);
                const fetchTime = new Date();
                memoizedTrains.current[cacheKey] = { trains: data, lastFetchTime: fetchTime };
                console.log('Got data. Adding to cache.');
                setLinkedTrainsData(prevState => ({ ...prevState, [profileId]: data }));
                setLastFetchTime(prevState => ({ ...prevState, [profileId]: fetchTime }));
            } catch (error) {
                setError('Error fetching trains');
            } finally {
                setLoading((prev) => ({ ...prev, [profileId]: false }));
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

