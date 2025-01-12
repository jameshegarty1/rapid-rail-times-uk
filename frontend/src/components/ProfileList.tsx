import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrainFront } from 'lucide-react';
import ProfileCard from './ProfileCard';
import { Watch } from 'react-loader-spinner';
import useProfiles from '../hooks/useProfiles';
import NewRoute from './NewRoute';
import { Profile } from '@/utils/interfaces';

export default function ProfileList() {
  const {
    profiles,
    linkedTrainsData,
    loading,
    expandedProfileId,
    setExpandedProfileId,
    handleDeleteProfile,
    handleUpdateProfile,
    handleCreateProfile,
    handleFetchTrains,
    handleFavouriteProfile,
    lastFetchTime,
    favouriteProfileId,
    setFavouriteProfileId,
  } = useProfiles();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const loadFavouriteTrains = async () => {
    const favouriteProfile = profiles.find((p) => p.id === favouriteProfileId);
    if (favouriteProfile) {
      await handleFetchTrains(
          favouriteProfile.origins,
          favouriteProfile.destinations,
          favouriteProfile.id
      );
    }
  };

  useEffect(() => {
    const loadFavouriteTrainsIfNeeded = async () => {
      if (!favouriteProfileId || !profiles.length) return;
      console.log("Favourite profile ID: ", favouriteProfileId);
      const favouriteProfile = profiles.find((p) => p.id === favouriteProfileId);
      if (!favouriteProfile) return;

      console.log('Loading trains for favourite profile:', favouriteProfileId);
      await handleFetchTrains(
          favouriteProfile.origins,
          favouriteProfile.destinations,
          favouriteProfile.id
      );
    };

    loadFavouriteTrainsIfNeeded();
  }, [favouriteProfileId]);



  const handleCardExpand = (profileId: number) => {
    console.log(
      'Expanding card:',
      profileId,
      'Current expanded:',
      expandedProfileId
    );
    setExpandedProfileId(expandedProfileId === profileId ? null : profileId);
  };

  const handleFavouriteButtonToggle = (profileId: number) => {
    const isSet = favouriteProfileId !== profileId;
    handleFavouriteProfile(profileId, isSet);

    // If setting as favourite, load trains immediately
    if (isSet) {
      const profile = profiles.find(p => p.id === profileId);
      if (profile) {
        handleFetchTrains(
            profile.origins,
            profile.destinations,
            profile.id
        );
      }
    }
  };

  const handleEdit = (profileId: number) => {
    const profileToEdit = profiles.find((p) => p.id === profileId);
    if (profileToEdit) {
      console.log('Editing profile:', profileToEdit);
      setEditingProfile(profileToEdit);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProfile(null);
  };

  const sortedProfiles = [...profiles].sort((a, b) => {
    if (a.id === favouriteProfileId) return -1;
    if (b.id === favouriteProfileId) return 1;
    return 0;
  });

  if (loading.global) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <Watch
          visible={true}
          height="40"
          width="40"
          ariaLabel="watch-loading"
          wrapperStyle={{}}
          wrapperClass=""
          color="#1e293b"
        />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* NewRoute for creating new routes */}
        <NewRoute
          onCreateProfile={handleCreateProfile}
          isOpen={isModalOpen && !editingProfile}
          isEditing={false}
          onOpenChange={setIsModalOpen}
          onClose={handleModalClose}
          isNewRoute={true}
        />

        {/* NewRoute for editing */}
        {editingProfile && (
          <NewRoute
            onCreateProfile={handleCreateProfile}
            onUpdateProfile={handleUpdateProfile}
            initialProfile={editingProfile}
            isEditing={true}
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            onClose={handleModalClose}
            isNewRoute={false}
          />
        )}
        {/* Profiles Grid */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-0">
          <div className="w-full sm:w-1/2 sm:pr-3">
            {sortedProfiles
              .slice(0, Math.ceil(sortedProfiles.length / 2))
              .map((profile) => (
                <div key={profile.id} className="mb-6 sm:mb-6 last:mb-2">
                  <ProfileCard
                    id={profile.id}
                    expanded={expandedProfileId === profile.id}
                    onExpand={() => handleCardExpand(profile.id)}
                    origins={profile.origins}
                    destinations={profile.destinations}
                    onEdit={() => handleEdit(profile.id)}
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
                    isFavourite={profile.id === favouriteProfileId}
                    onFavouriteToggle={() => handleFavouriteButtonToggle(profile.id)}
                  />
                </div>
              ))}
          </div>

          <div className="w-full sm:w-1/2 sm:pl-3">
            {sortedProfiles
              .slice(Math.ceil(sortedProfiles.length / 2))
              .map((profile) => (
                <div key={profile.id} className="mb-6 sm:mb-6">
                  <ProfileCard
                    id={profile.id}
                    expanded={expandedProfileId === profile.id}
                    onExpand={() => handleCardExpand(profile.id)}
                    origins={profile.origins}
                    destinations={profile.destinations}
                    onEdit={() => handleEdit(profile.id)}
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
                    isFavourite={profile.id === favouriteProfileId}
                    onFavouriteToggle={() => handleFavouriteButtonToggle(profile.id)}
                  />
                </div>
              ))}
          </div>

          {/* Empty State */}
          {profiles.length === 0 && (
            <Card className="w-full bg-gray-50 border-dashed">
              <CardContent className="py-8 sm:py-10 lg:py-12">
                <div className="text-center">
                  <TrainFront className="mx-auto h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-400" />
                  <h3 className="mt-3 sm:mt-4 text-base sm:text-lg lg:text-xl font-medium text-gray-900">
                    No profiles yet
                  </h3>
                  <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">
                    Get started by creating a new train profile.
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
