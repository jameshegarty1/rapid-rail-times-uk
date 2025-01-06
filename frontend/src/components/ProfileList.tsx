import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrainFront } from 'lucide-react';
import ProfileForm from './ProfileForm';
import ProfileCard from './ProfileCard';
import { Watch } from 'react-loader-spinner';
import useProfiles from '../hooks/useProfiles';
import { Profile } from '../utils/interfaces';

export default function ProfileList() {
  const {
    profiles,
    origins,
    destinations,
    linkedTrainsData,
    loading,
    error,
    editingProfile,
    expandedProfileId,
    setOrigins,
    setDestinations,
    setEditingProfile,
    setExpandedProfileId,
    handleCreateProfile,
    handleUpdateProfile,
    handleDeleteProfile,
    handleFetchTrains,
    lastFetchTime,
  } = useProfiles();

  useEffect(() => {
    console.log('Pre-loading trains for each profile.');
    const preloadTrainData = async () => {
      for (const profile of profiles) {
        await handleFetchTrains(
          profile.origins,
          profile.destinations,
          profile.id
        );
      }
    };
    preloadTrainData();
  }, [profiles]);

  const handleSelectChange = (
    values: string[],
    fieldName: 'origins' | 'destinations'
  ) => {
    if (fieldName === 'origins') {
      setOrigins(values);
    } else {
      setDestinations(values);
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
    console.log(
      'Submitting form with origins:',
      origins,
      'and destinations:',
      destinations
    );
    if (editingProfile) {
      handleUpdateProfile(editingProfile.id, origins, destinations);
    } else {
      handleCreateProfile(origins, destinations);
    }
  };

  const handleCardExpand = (profileId: number) => {
    console.log(
      'Expanding card:',
      profileId,
      'Current expanded:',
      expandedProfileId
    );
    setExpandedProfileId(expandedProfileId === profileId ? null : profileId);
  };

  if (loading.global) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Watch
          visible={true}
          height="40"
          width="40"
          ariaLabel="watch-loading"
          wrapperStyle={{}}
          wrapperClass=""
          color="#4fa94d"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Create/Edit Profile Section */}
        <Card className="mb-8 sm:mb-6 lg:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl">
              <TrainFront className="h-5 w-5" />
              <span>
                {editingProfile ? 'Edit Profile' : 'Create New Profile'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <ProfileForm
              origins={origins}
              destinations={destinations}
              loading={Object.values(loading).some((isLoading) => isLoading)}
              onChange={handleSelectChange}
              onSubmit={handleSubmit}
              editingProfile={editingProfile !== null}
              onEditingProfileChange={(editing) =>
                setEditingProfile(editing ? editingProfile : null)
              }
              maxOrigins={3}
            />
          </CardContent>
        </Card>

        {/* Profiles Grid */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-0">
          {/*<div className="w-full sm:w-[calc(50%-12px)]">*/}
          <div className="w-full sm:w-1/2 sm:pr-3">
            {profiles
              .slice(0, Math.ceil(profiles.length / 2))
              .map((profile) => (
                <div key={profile.id} className="mb-6 sm:mb-6 last:mb-2">
                  <ProfileCard
                    id={profile.id}
                    expanded={expandedProfileId === profile.id}
                    onExpand={() => handleCardExpand(profile.id)}
                    origins={profile.origins}
                    destinations={profile.destinations}
                    onEdit={() => handleEdit(profile)}
                    onDelete={() => handleDeleteProfile(profile.id)}
                    onRefresh={() =>
                      handleFetchTrains(
                        profile.origins,
                        profile.destinations,
                        profile.id,
                        true
                      )
                    }
                    onClick={() =>
                      handleFetchTrains(
                        profile.origins,
                        profile.destinations,
                        profile.id
                      )
                    }
                    trains={linkedTrainsData[profile.id]}
                    lastFetchTime={lastFetchTime[profile.id]}
                    loading={loading[profile.id] || false}
                  />
                </div>
              ))}
          </div>

          {/* Second Column */}
          <div className="w-full sm:w-1/2 sm:pl-3">
            {profiles.slice(Math.ceil(profiles.length / 2)).map((profile) => (
              <div key={profile.id} className="mb-6 sm:mb-6">
                <ProfileCard
                  id={profile.id}
                  expanded={expandedProfileId === profile.id}
                  onExpand={() => handleCardExpand(profile.id)}
                  origins={profile.origins}
                  destinations={profile.destinations}
                  onEdit={() => handleEdit(profile)}
                  onDelete={() => handleDeleteProfile(profile.id)}
                  onRefresh={() =>
                    handleFetchTrains(
                      profile.origins,
                      profile.destinations,
                      profile.id,
                      true
                    )
                  }
                  onClick={() =>
                    handleFetchTrains(
                      profile.origins,
                      profile.destinations,
                      profile.id
                    )
                  }
                  trains={linkedTrainsData[profile.id]}
                  lastFetchTime={lastFetchTime[profile.id]}
                  loading={loading[profile.id] || false}
                />
              </div>
            ))}
          </div>

          {/* Empty State */}
          {profiles.length === 0 && (
            <Card className="bg-gray-50 border-dashed">
              <CardContent className="py-8 sm:py-10 lg:py-12">
                <div className="text-center">
                  <TrainFront className="mx-auto h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-400" />
                  <h3 className="mt-3 sm:mt-4 text-base sm:text-lg lg:text-xl font-medium text-gray-900">
                    No profiles yet
                  </h3>
                  <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">
                    Get started by creating a new train profile above.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
