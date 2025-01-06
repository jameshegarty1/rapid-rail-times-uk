import React from 'react';
import { Button } from '@/components/ui/button';
import StationSelector from './StationSelector';
import stationData from '../config/stations.json';
import {ArrowDown, ArrowRight, Train} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import trainIcon from '../assets/train.svg';

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
    //e.preventDefault();
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
        <div className="flex flex-col md:flex-row md:items-start gap-2 sm:gap-4">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700">
                <div className="flex items-center w-full">
                  <span>From</span>
                  <img src={trainIcon} alt="Train" className="w-16 h-16 ml-auto" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StationSelector
                label="Origins"
                selectedStations={origins}
                onChange={(values) => onChange(values, 'origins')}
                stations={stationData}
                maxSelections={maxOrigins}
              />
            </CardContent>
          </Card>

          <div className="flex justify-center items-center py-2 md:py-8">
            <ArrowDown className="h-6 w-6 text-gray-400 md:hidden" />
            <ArrowRight className="hidden md:block h-6 w-6 text-gray-400" />
          </div>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700">
                <div className="flex items-center w-full">
                  <span>To</span>
                  <img src={trainIcon} alt="Train" className="w-16 h-16 ml-auto scale-x-[-1]" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StationSelector
                label="Destinations"
                selectedStations={destinations}
                onChange={(values) => onChange(values, 'destinations')}
                stations={stationData}
              />
            </CardContent>
          </Card>

          <div className="flex flex-row lg:flex-col gap-2 sm:gap-4 mt-4 sm:mt-6">
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 px-4 py-2 text-sm sm:text-base"
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
                className="w-fullsm:flex-1 px-4 py-2 text-sm sm:text-base"
                onClick={handleFormReset}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
