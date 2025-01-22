import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, RefreshCcw, Edit2, Trash2, Star } from 'lucide-react';
import { Watch } from 'react-loader-spinner';
import TrainList from './TrainList';
import { Train } from '../utils/interfaces';
import stationData from '../config/stations.json';
import { getTimeFromString } from '../lib/utils';
import { Badge } from '@/components/ui/badge';

const createAlphaToNameMap = (stations: { ALPHA: string; NAME: string }[]) => {
  const map: { [key: string]: string } = {};
  stations.forEach((station) => {
    map[station.ALPHA] = station.NAME;
  });
  return map;
};

const alphaToNameMap = createAlphaToNameMap(stationData);

const getNameFromAlpha = (alpha: string) => {
  return alphaToNameMap[alpha] || alpha;
};

interface ProfileCardProps {
  id: number;
  expanded: boolean;
  onExpand: () => void;
  origins: string[];
  destinations: string[];
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
  onRefresh: () => void;
  trains?: Train[];
  lastFetchTime?: Date | null;
  loading: boolean;
  isFavourite: boolean;
  onFavouriteToggle: () => void;
}

export default function ProfileCard({
  id,
  expanded,
  onExpand,
  origins,
  destinations,
  onEdit,
  onDelete,
  onRefresh,
  onClick,
  trains = [],
  lastFetchTime,
  loading,
  isFavourite,
  onFavouriteToggle,
}: ProfileCardProps) {
  const handleToggleExpand = () => {
    onExpand();
    if (!expanded) {
      onClick();
    }
  };

  const getNextTrain = () => {
    if (!trains.length) return null;

    const now = new Date().getTime();

    const nextTrain = trains.reduce((nearest: Train | null, train: Train) => {
      // Skip cancelled trains
      if (train.is_cancelled) return nearest;

      // Get actual departure time based on status
      let departureTime: number;

      if (train.estimated_departure === 'On time') {
        departureTime = getTimeFromString(train.scheduled_departure);
      } else if (
        train.estimated_departure === 'Delayed' ||
        train.estimated_departure === 'Cancelled'
      ) {
        // For delayed trains with no specific time, use scheduled time as estimate
        departureTime = getTimeFromString(train.scheduled_departure);
      } else {
        // For trains with specific estimated time
        departureTime = getTimeFromString(train.estimated_departure);
      }

      // Skip trains that have already departed
      if (departureTime < now) return nearest;

      // If no nearest train yet, use this one
      if (!nearest) return train;

      // Get departure time for current nearest train
      let nearestDepartureTime: number;
      if (nearest.estimated_departure === 'On time') {
        nearestDepartureTime = getTimeFromString(nearest.scheduled_departure);
      } else if (
        nearest.estimated_departure === 'Delayed' ||
        nearest.estimated_departure === 'Cancelled'
      ) {
        nearestDepartureTime = getTimeFromString(nearest.scheduled_departure);
      } else {
        nearestDepartureTime = getTimeFromString(nearest.estimated_departure);
      }

      // Return the earlier train
      return departureTime < nearestDepartureTime ? train : nearest;
    }, null);

    if (!nextTrain) return null;

    // Get final departure time for display
    let nextTrainTime: number;
    if (
      nextTrain.estimated_departure === 'On time' ||
      nextTrain.estimated_departure === 'Delayed' ||
      nextTrain.estimated_departure === 'Cancelled'
    ) {
      nextTrainTime = getTimeFromString(nextTrain.scheduled_departure);
    } else {
      nextTrainTime = getTimeFromString(nextTrain.estimated_departure);
    }

    return formatDistanceToNow(nextTrainTime);
  };

  const nextTrainTime = getNextTrain();

  return (
    <Card
      className={`group transition-all duration-200 cursor-pointer hover:shadow-lg
        ${expanded ? 'h-auto' : 'h-fit'}`}
      onClick={(e) => {
        e.preventDefault();
        handleToggleExpand();
      }}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-6">
          {/* Header with Buttons to interact with profile */}
          <div className="flex items-start justify-between">
            <Button
              variant="ghost"
              size="sm"
              className={`-mt-1 -ml-2 p-2 ${
                isFavourite ? 'text-yellow-500' : 'text-gray-400'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onFavouriteToggle();
              }}
            >
              <Star
                className="h-5 w-5"
                fill={isFavourite ? 'currentColor' : 'none'}
              />
            </Button>

            {/* Next Train Info for Favourite */}
            {isFavourite && nextTrainTime && !loading && (
              <Badge
                variant="secondary"
                className="text-xs sm:text-sm font-medium"
              >
                Next train {nextTrainTime}
              </Badge>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                className="p-2 sm:p-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit2 className="h-4 w-4 " />
                {/*Edit*/}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 sm:p-3  text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                {/*Delete*/}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="p-2 sm:p-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onRefresh();
                }}
              >
                <RefreshCcw className="h-4 w-4" />
                {/*Refresh*/}
              </Button>
            </div>
          </div>
          {/* Route Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
            {/* From Section */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 space-x-2 text-gray-500 text-smi sm:text-base">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>From</span>
              </div>
              <div className="space-y-1.5">
                {origins.map((origin, index) => (
                  <div key={index} className="pl-4 sm:pl-6">
                    <div className="text-sm sm:text-base">
                      {getNameFromAlpha(origin)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {origin}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 gap-2 text-gray-500 text-sm sm:text-base">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>To</span>
              </div>
              <div className="space-y-2">
                {destinations.map((destination, index) => (
                  <div key={index} className="pl-4 sm:pl-6">
                    <div className="font-medium text-sm sm:text-base">
                      {getNameFromAlpha(destination)}
                    </div>
                    <div className="text-sm sm:text-sm text-gray-500">
                      {destination}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expanded Content */}
          {expanded && (
            <div className="pt-4 sm:pt-6 border-t">
              {loading ? (
                <div className="flex justify-center items-center py-6 sm:py-8">
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
              ) : (
                <>
                  <TrainList trains={trains} destinations={destinations} />
                  {lastFetchTime && (
                    <div className="text-xs sm:text-sm text-gray-500 text-right mt-3 sm:mt-4">
                      Updated{' '}
                      {formatDistanceToNow(new Date(lastFetchTime), {
                        addSuffix: true,
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
