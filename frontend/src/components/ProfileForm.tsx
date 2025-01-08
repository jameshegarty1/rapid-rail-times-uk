import React from 'react';
import { Button } from '@/components/ui/button';
import RouteSelector from './RouteSelector';

interface ProfileFormProps {
  origins: string[];
  destinations: string[];
  loading: boolean;
  onChange: (values: string[], fieldName: 'origins' | 'destinations') => void;
  onSubmit: (e: React.FormEvent) => void;
  editingProfile: boolean;
  onEditingProfileChange: (editing: boolean) => void;
  maxOrigins: number;
}

export default function ProfileForm({
  origins,
  destinations,
  loading,
  onChange,
  onSubmit,
  editingProfile,
  onEditingProfileChange,
  maxOrigins,
}: ProfileFormProps) {
  const handleFormReset = (e: React.MouseEvent) => {
    onChange([], 'origins');
    onChange([], 'destinations');
    onEditingProfileChange(false);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="w-full px-4 sm:px-6 md:px-8 mx-auto max-w-xl sm:max-w-2xl md:max-w-4xl"
    >
      <div className="space-y-4 sm:space-y-6">
        <RouteSelector
          origins={origins}
          destinations={destinations}
          onChange={onChange}
          maxOrigins={maxOrigins}
        />

        <div className="flex flex-row gap-2 sm:gap-4 mt-4 sm:mt-6 justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm sm:text-base"
          >
            {loading
              ? 'Processing...'
              : editingProfile
              ? 'Update Profile'
              : 'Create Profile'}
          </Button>

          {(origins.length > 0 || destinations.length > 0) && (
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              className="px-4 py-2 text-sm sm:text-base"
              onClick={handleFormReset}
            >
              Reset
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
