// api.ts
import axiosInstance from './axiosInstance';
import { Train, Profile, TaskResponse} from './interfaces'

export const fetchTrains = async (
  origins: string[], 
  destinations: string[], 
  forceFetch = false
): Promise<Train[]> => {
  try {
    const taskResponse = await axiosInstance.get<TaskResponse>('/api/v1/train/train_routes/', {
      params: {
        'origins': origins,
        'destinations': destinations,
        forceFetch
      },
    });

    if (taskResponse.data.status === 'pending') {
      const result = await pollTaskStatus(taskResponse.data.task_id);
      return result;
    }

    return taskResponse.data.result!;
  } catch (error) {
    console.error('Error fetching trains:', error);
    throw error;
  }
};

const pollTaskStatus = async (
  taskId: string, 
  maxAttempts = 30
): Promise<Train[]> => {
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      const response = await axiosInstance.get<TaskResponse>(
        `/api/v1/train/train_routes/task_status/${taskId}`
      );

      console.log("Task status: ", response.data.status);
      
      if (response.data.status === 'completed') {
        return response.data.result!;
      }
      
      if (response.data.status === 'failed') {
        throw new Error(response.data.error);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
      
    } catch (error) {
      console.error('Error polling task status:', error);
      throw error;
    }
  }

  throw new Error('Task timed out');
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

