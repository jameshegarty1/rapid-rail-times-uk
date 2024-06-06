import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Navbar,
  NavBrand,
  LogoutButton,
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
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
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

  const createProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/v1/profile/', {
        origin,
        destination,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfiles([...profiles, response.data]);
      setOrigin('');
      setDestination('');
      console.log('Profile created successfully:', response.data);
    } catch (error) {
      setError('Error creating profile');
      console.error('Error creating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/v1/profile/${id}`, {
        origin,
        destination,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfiles(
        profiles.map((profile) => (profile.id === id ? response.data : profile))
      );
      setOrigin('');
      setDestination('');
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

  const handleEdit = (profile: Profile) => {
    setOrigin(profile.origin);
    setDestination(profile.destination);
    setEditingProfile(profile);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProfile) {
      updateProfile(editingProfile.id);
    } else {
      createProfile();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    // Redirect to login or refresh the page
  };

  return (
    <div>
      <Navbar>
        <NavBrand>Train App</NavBrand>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </Navbar>

      <Container>
        <h1>User Profiles</h1>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Origin"
          />
          <Input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Destination"
          />
          <Button type="submit" disabled={loading}>
            {editingProfile ? 'Update Profile' : 'Create Profile'}
          </Button>
        </Form>
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
