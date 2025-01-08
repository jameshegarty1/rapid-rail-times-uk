import { useState, useRef } from 'react';
import { fetchTrains } from '../utils/api';
import { Train } from '../utils/interfaces';

interface MemoizedTrains {
    trains: Train[];
    lastFetchTime: Date;
}

interface UseTrainsReturn {
    trainsData: { [key: string]: Train[] };
    loading: { [key: string]: boolean };
    error: string | null;
    lastFetchTime: { [key: string]: Date | null };
    fetchTrainsForRoute: (
        origins: string[],
        destinations: string[],
        routeId: string,
        forceFetch?: boolean
    ) => Promise<void>;
}

export default function useTrains(): UseTrainsReturn {
    const [trainsData, setTrainsData] = useState<{ [key: string]: Train[] }>({});
    const [lastFetchTime, setLastFetchTime] = useState<{ [key: string]: Date | null }>({});
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
    const [error, setError] = useState<string | null>(null);

    const memoizedTrains = useRef<{ [key: string]: MemoizedTrains }>({});

    const fetchTrainsForRoute = async (
        origins: string[],
        destinations: string[],
        routeId: string,
        forceFetch = false
    ) => {
        const cacheKey = `${origins.join('-')}_${destinations.join('-')}`;

        // Check local cache first
        if (!forceFetch && memoizedTrains.current[cacheKey]) {
            console.log('Returning cached data');
            const cachedData = memoizedTrains.current[cacheKey];
            setTrainsData(prevState => ({ ...prevState, [routeId]: cachedData.trains }));
            setLastFetchTime(prevState => ({
                ...prevState,
                [routeId]: new Date(cachedData.lastFetchTime)
            }));
        } else {
            console.log('Fetching new data');
            setLoading((prev) => ({ ...prev, [routeId]: true }));
            setError(null);

            try {
                const data = await fetchTrains(origins, destinations, forceFetch);
                const fetchTime = new Date();

                memoizedTrains.current[cacheKey] = {
                    trains: data,
                    lastFetchTime: fetchTime
                };

                console.log('Got data. Adding to cache.');
                setTrainsData(prevState => ({ ...prevState, [routeId]: data }));
                setLastFetchTime(prevState => ({ ...prevState, [routeId]: fetchTime }));
            } catch (error) {
                setError('Error fetching trains');
            } finally {
                setLoading((prev) => ({ ...prev, [routeId]: false }));
            }
        }
    };

    return {
        trainsData,
        loading,
        error,
        lastFetchTime,
        fetchTrainsForRoute,
    };
}