import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, RefreshCcw, Edit2, Trash2 } from 'lucide-react';
import { Watch } from 'react-loader-spinner';
import TrainList from './TrainList';
import { Train } from '../utils/interfaces';
import stationData from '../config/stations.json';

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
}: ProfileCardProps) {
  const handleToggleExpand = () => {
    onExpand();
    if (!expanded) {
      onClick();
    }
  };

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 cursor-pointer ${
    expanded ? 'h-auto' : 'h-fit'
  }"
      onClick={(e) => {
        e.preventDefault();
        handleToggleExpand();
      }}
    >
      <CardContent className="p-6 sm:p-6">
        <div className="space-y-6 sm:space-y-6">
          {/* Route Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* From Section */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center space-x-2 text-gray-500 text-smi sm:text-base">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>From</span>
              </div>
              <div className="space-y-2">
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
              <div className="flex items-center space-x-2 text-gray-500 text-sm sm:text-base">
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

          {/* Actions */}
          <div className="flex items-center justify-end  gap-2">
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
                    color="#4fa94d"
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
