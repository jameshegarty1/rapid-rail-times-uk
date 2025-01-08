import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowRight } from 'lucide-react';
import StationSelector from './StationSelector';
import stationData from '../config/stations.json';
import trainIcon from '../assets/train.svg';

interface RouteSelectorProps {
  origins: string[];
  destinations: string[];
  onChange: (values: string[], fieldName: 'origins' | 'destinations') => void;
  maxOrigins?: number;
  className?: string;
}

export default function RouteSelector({
  origins,
  destinations,
  onChange,
  maxOrigins,
  className = '',
}: RouteSelectorProps) {
  return (
    <div
      className={`flex flex-col md:flex-row md:items-start gap-2 sm:gap-4 w-full ${className}`}
    >
      <Card className="flex-1 w-full">
        <CardHeader className="px-3 sm:px-4 md:px-6 pb-0 pt-2 sm:pt-3">
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-700">
            <div className="flex items-center w-full">
              <span>From</span>
              <img
                src={trainIcon}
                alt="Train"
                className="w-20 h-16 sm:h-20 sm:w-24 ml-auto"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 px-3 sm:px-4 md:px-6">
          <StationSelector
            label="Origins"
            selectedStations={origins}
            onChange={(values) => onChange(values, 'origins')}
            stations={stationData}
            maxSelections={maxOrigins}
          />
        </CardContent>
      </Card>

      <div className="flex justify-center items-center py-1 sm:py-2 md:py-8">
        <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 md:hidden" />
        <ArrowRight className="hidden md:block h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
      </div>

      <Card className="flex-1 w-full">
        <CardHeader className="px-3 sm:px-4 md:px-6 pb-0 pt-2 sm:pt-3">
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-700">
            <div className="flex items-center w-full">
              <span>To</span>
              <img
                src={trainIcon}
                alt="Train"
                className="w-20 h-16 sm:h-20 sm:w-24 ml-auto scale-x-[-1]"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 px-3 sm:px-4 md:px-6">
          <StationSelector
            label="Destinations"
            selectedStations={destinations}
            onChange={(values) => onChange(values, 'destinations')}
            stations={stationData}
          />
        </CardContent>
      </Card>
    </div>
  );
}
