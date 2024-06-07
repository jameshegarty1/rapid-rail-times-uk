import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import Navbar from './Navbar'
import { useNavigate } from 'react-router-dom';
import { MultiValue, ActionMeta } from 'react-select';

interface Profile {
  id: number;
  origin: string;
  destination: string;
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

  const fetchTrains = async (origin: string, destination: string) => {
    console.log("Trying to fetch trains with origins: ", origins, " destinations: ", destinations);
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/train/train_routes/', {
        params: { origin, destination },
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    setOrigins([profile.origin]);
    setDestinations([profile.destination]);
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
              <Card onClick={() => fetchTrains(profile.origin, profile.destination)}>
                <CardTitle>{profile.origin} to {profile.destination}</CardTitle>
                <Button onClick={() => handleEdit(profile)}>Edit</Button>
                <Button onClick={() => deleteProfile(profile.id)}>Delete</Button>
              </Card>
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
