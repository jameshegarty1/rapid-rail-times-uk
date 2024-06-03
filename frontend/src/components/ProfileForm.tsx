import React from 'react';
import { Form, Input, Button } from './ProfileList.styles';

interface ProfileFormProps {
  origin: string;
  destination: string;
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  editingProfile: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  origin,
  destination,
  loading,
  onChange,
  onSubmit,
  editingProfile,
}) => {
  return (
    <Form onSubmit={onSubmit}>
      <Input
        type="text"
        value={origin}
        onChange={onChange}
        name="origin"
        placeholder="Origin"
      />
      <Input
        type="text"
        value={destination}
        onChange={onChange}
        name="destination"
        placeholder="Destination"
      />
      <Button type="submit" disabled={loading}>
        {editingProfile ? 'Update Profile' : 'Create Profile'}
      </Button>
    </Form>
  );
};

export default ProfileForm;

