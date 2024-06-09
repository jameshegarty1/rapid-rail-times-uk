import React, { useRef } from 'react';
import {
  Container,
  Row,
  Col,
  Error,
  TrainList,
  TrainItem
} from './ProfileList.styles';
import ProfileForm from './ProfileForm';
import ProfileCard from './ProfileCard';
import Navbar from './Navbar'
import { useNavigate } from 'react-router-dom';
import { MultiValue, ActionMeta } from 'react-select';
import { fetchTrains as fetchTrainsApi } from '../utils/api';
import useProfiles from '../hooks/useProfiles';

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

interface MemoizedData {
  trains: Train[];
  lastFetchTime: Date;
}

export default function ProfileList() {
  const {
    profiles,
    origins,
    destinations,
    trains,
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
    setTrains,
    setLoading,
    setError
  } = useProfiles();

  const navigate = useNavigate();

  const memoizedTrains = useRef<{ [key: string]: MemoizedData }>({});

  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  const fetchTrains = async (origins: string[], destinations: string[]) => {
    const cacheKey = `${origins.join('-')}_${destinations.join('-')}`;
    if (memoizedTrains.current[cacheKey]) {
      console.log('Returning cached data');
      const cachedData = memoizedTrains.current[cacheKey];
      setTrains(cachedData.trains);
      setLastFetchTime(new Date(cachedData.lastFetchTime));
    } else {
      console.log('Fetching new data');
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTrainsApi(origins, destinations);
        memoizedTrains.current[cacheKey] = { trains: data, lastFetchTime: new Date() };
        setTrains(data);
        setLastFetchTime(new Date());
      } catch (error) {
        setError('Error fetching trains');
      } finally {
        setLoading(false);
      }
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
      handleUpdateProfile(editingProfile.id, origins, destinations);
    } else {
      handleCreateProfile(origins, destinations);
    }
  };

  const handleCardClick = (profile: Profile) => {
    console.log('Clicked on profile:', profile);
    fetchTrains(profile.origins, profile.destinations);
  };

const handleLogout = () => {
    console.log('Logging out');
    navigate('/logout');
  };

 return (
    <div>
      <Navbar onLogout={handleLogout} />

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
                onDelete={() => handleDeleteProfile(profile.id)}
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
}
