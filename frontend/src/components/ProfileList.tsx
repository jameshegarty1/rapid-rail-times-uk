import React, { useState, useRef, useEffect } from 'react';
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

export default function ProfileList() {
  const {
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
  } = useProfiles();



  useEffect(() => {
    console.log("Pre-loading trains for each profile.");
    const preloadTrainData = async () => {
      for (const profile of profiles) {
        await handleFetchTrains(profile.origins, profile.destinations, profile.id);
      }
    };

    preloadTrainData();
  }, [profiles]); 

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

  const handleRefreshTrains = (profile: Profile) => {
    console.log('Refreshing train data for profile:', profile);
    handleFetchTrains(profile.origins, profile.destinations, profile.id, true);
  };

  const handleCardClick = (profile: Profile) => {
    console.log('Clicked on profile:', profile);
    handleFetchTrains(profile.origins, profile.destinations, profile.id);
  };

 return (
    <div>
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

        <Row>
          {profiles.map((profile) => (
            <Col key={profile.id}>
              <ProfileCard
                origins={profile.origins}
                destinations={profile.destinations}
                onEdit={() => handleEdit(profile)}
                onDelete={() => handleDeleteProfile(profile.id)}
                onRefresh={() => handleRefreshTrains(profile)}
                onClick={() => handleCardClick(profile)}
                trains={linkedTrainsData[profile.id]}
                lastFetchTime={lastFetchTime[profile.id]}
              />
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}
