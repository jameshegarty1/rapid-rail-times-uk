// api.ts
import axiosInstance from './axiosInstance';

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

export const fetchTrains = async (origins: string[], destinations: string[], forceFetch = false): Promise<Train[]> => {
  const response = await axiosInstance.get('/api/v1/train/train_routes/', {
    params: {
      origins,
      destinations,
      forceFetch
    },
  });
  return response.data.result;
};

export const fetchProfiles = async (): Promise<Profile[]> => {
  const response = await axiosInstance.get('/api/v1/profile/');
  return response.data;
};

export const createProfile = async (origins: string[], destinations: string[]): Promise<Profile> => {
  const response = await axiosInstance.post('/api/v1/profile/', {
    origins,
    destinations,
  });
  return response.data;
};

export const updateProfile = async (id: number, origins: string[], destinations: string[]): Promise<Profile> => {
  const response = await axiosInstance.put(`/api/v1/profile/${id}`, {
    origins,
    destinations,
  });
  return response.data;
};

export const deleteProfile = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/v1/profile/${id}`);
};

