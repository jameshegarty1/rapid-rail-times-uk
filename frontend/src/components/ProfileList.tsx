import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import {
  Container,
  Row,
  Col,
  Card,
  CardTitle,
  Button,
  Form,
  Input,
  Error,
  TrainList,
  TrainItem
} from './ProfileList.styles';
import ProfileForm from './ProfileForm';
import ProfileCard from './ProfileCard';
import Navbar from './Navbar'
import { useNavigate } from 'react-router-dom';
import { MultiValue, ActionMeta } from 'react-select';

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

export default function ProfileList() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [origins, setOrigins] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const navigate = useNavigate();

  const fetchProfiles = async () => {
    console.log("Fetching profiles")
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/profile/', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setProfiles(response.data);
      console.log('Profiles fetched successfully:', response.data);
    } catch (error) {
      setError('Error fetching profiles');
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrains = async (origins: string[], destinations: string[]) => {
  console.log("Trying to fetch trains with origins: ", origins, " destinations: ", destinations);

  setLoading(true);
  setError(null);

  const token = localStorage.getItem('token');

  try {
    const response = await axios.get('/api/v1/train/train_routes/', {
      params: {
        origins: origins,
        destinations: destinations,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const trainsData = response.data.result;

    if (Array.isArray(trainsData)) {
      setTrains(trainsData);
    } else {
      console.error('Expected an array but got:', trainsData);
      setError('Invalid train data format received from the server');
      setTrains([]);
    }
    console.log('Train recommendations fetched successfully:', response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('Error response data:', error.response.data);
        // Ensure error is set to a string
        setError(error.message);
      } else {
        console.error('Error message:', error.message);
        setError(error.message);
      }
    } else {
      console.error('Unexpected error:', error);
      setError('An unexpected error occurred');
    }
  } finally {
    setLoading(false);
  }
};

  const createProfile = async (origins: string[], destinations: string[]) => {
    console.log("Trying to create profile with origins: ", origins, " destinations: ", destinations);
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/v1/profile/', {
        origins,
        destinations,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfiles([...profiles, response.data]);
      setOrigins([]);
      setDestinations([]);
      console.log('Profile created successfully:', response.data);
    } catch (error) {
      setError('Error creating profile');
      console.error('Error creating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (id: number, origins: string[], destinations: string[]) => {
    console.log("Trying to update profile with id: ", id);
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/v1/profile/${id}`, {
        origins,
        destinations,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfiles(
        profiles.map((profile) => (profile.id === id ? response.data : profile))
      );
      setOrigins([]);
      setDestinations([]);
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
      const token = localStorage.getItem('token');
      await axios.delete(`/api/v1/profile/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfiles(profiles.filter((profile) => profile.id !== id));
      console.log('Profile deleted successfully');
    } catch (error) {
      setError('Error deleting profile');
      console.error('Error deleting profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (selectedOptions: MultiValue<{ label: string; value: string }>, actionMeta: ActionMeta<{ label: string; value: string }>, fieldName: string) => {
    console.log('Select change action:', actionMeta.name, 'selected options:', selectedOptions);
    if (fieldName === 'origins') {
      setOrigins(selectedOptions.map(option => option.value));
    } else if (fieldName === 'destinations') {
      setDestinations(selectedOptions.map(option => option.value));
    }
  };

  const handleEdit = (profile: Profile) => {
    console.log('Editing profile:', profile);
    setOrigins(profile.origins);
    setDestinations(profile.destinations);
    setEditingProfile(profile);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form with origins:', origins, 'and destinations:', destinations);
    if (editingProfile) {
      updateProfile(editingProfile.id, origins, destinations);
    } else {
      createProfile(origins, destinations);
    }
  };

  const handleCardClick = (profile: Profile) => {
    console.log('Clicked on profile:', profile);
    fetchTrains(profile.origins, profile.destinations);
  }

  const handleLogout = () => {
    console.log('Logging out');
    navigate('/logout');
  };

  return (
    <div>
      <Navbar onLogout={handleLogout}/>

      <Container>
        <h1>User Profiles</h1>
        <ProfileForm
          origins={origins}
          destinations={destinations}
          loading={loading}
          onChange={handleSelectChange}
          onSubmit={handleSubmit}
          editingProfile={editingProfile !== null}
          maxOrigins={3}
        />
        
        {error && <Error>{error}</Error>}
        {loading && <p>Loading...</p>}

        <Row>
          {profiles.map((profile) => (
            <Col key={profile.id}>
              <ProfileCard
                origins={profile.origins}
                destinations={profile.destinations}
                onEdit={() => handleEdit(profile)}
                onDelete={() => deleteProfile(profile.id)}
                onClick={() => handleCardClick(profile)}
              />
            </Col>
          ))}
        </Row>

        <h2>Train Recommendations</h2>
        <TrainList>
          {trains.map((train, index) => (
            <TrainItem key={index}>
              {train.scheduled_departure} to {train.destination} - Scheduled: {train.scheduled_departure} - Estimated: {train.estimated_departure}
            </TrainItem>
          ))}
        </TrainList>
      </Container>
    </div>
  );
};
