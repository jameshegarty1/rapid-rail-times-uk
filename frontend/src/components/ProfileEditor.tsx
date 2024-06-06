import React, { useState } from 'react';
import ProfileForm from './ProfileForm';
import { MultiValue, ActionMeta } from 'react-select';

export default function ProfileEditor({
  onSubmit,
  editingProfile,
  loading
}: {
  onSubmit: (origins: string[], destinations: string[]) => void,
  editingProfile: boolean,
  loading: boolean
}) {
  const [origins, setOrigins] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);

  const handleSelectChange = (selectedOptions: MultiValue<{ label: string; value: string }>, actionMeta: ActionMeta<{ label: string; value: string }>) => {
    if (actionMeta.name === 'origins') {
      setOrigins(selectedOptions.map(option => option.value));
    } else if (actionMeta.name === 'destinations') {
      setDestinations(selectedOptions.map(option => option.value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(origins, destinations);
  };

  return (
    <ProfileForm
      origins={origins}
      destinations={destinations}
      loading={loading}
      onChange={handleSelectChange}
      onSubmit={handleSubmit}
      editingProfile={editingProfile}
    />
  );
};
