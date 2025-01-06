import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrainFront as TrainIcon,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
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

interface TrainListProps {
  trains?: Train[];
  destinations: string[];
}

export default function TrainList({ trains, destinations }: TrainListProps) {
  const [expandedTrains, setExpandedTrains] = useState<number[]>([]);

  const toggleExpand = (index: number) => {
    setExpandedTrains((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  if (!trains || trains.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No trains found for this route</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trains.map((train, index) => {
        const isExpanded = expandedTrains.includes(index);

        return (
          <Card
            key={index}
            className="bg-white hover:shadow-md transition-shadow cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(index);
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <TrainIcon className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium">
                      {train.scheduled_departure}
                    </div>
                    <div className="text-sm text-gray-500">
                      {train.origin} to {train.destination}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge
                    variant={
                      train.estimated_departure === 'On time'
                        ? 'default'
                        : 'destructive'
                    }
                    className={`
                      ${
                        train.estimated_departure === 'On time'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }
                    `}
                  >
                    {train.estimated_departure}
                  </Badge>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">Platform</p>
                      <p className="font-medium">{train.platform || 'TBA'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Coaches</p>
                      <p className="font-medium">{train.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Operator</p>
                      <p className="font-medium">{train.operator}</p>
                    </div>
                  </div>

                  {train.subsequent_calling_points &&
                    train.subsequent_calling_points.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500 mb-2">
                          Calling at:
                        </p>
                        <div className="space-y-2">
                          {train.subsequent_calling_points.map((point, idx) => {
                            const isDestination = destinations.includes(
                              point.crs
                            );
                            return (
                              <div
                                key={idx}
                                className={`flex items-center justify-between p-2 rounded-md
                                ${
                                  isDestination
                                    ? 'bg-blue-50 border-l-4 border-blue-500'
                                    : 'bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span
                                    className={`font-medium ${
                                      isDestination ? 'text-blue-700' : ''
                                    }`}
                                  >
                                    {point.st}
                                  </span>
                                </div>
                                <span
                                  className={
                                    isDestination
                                      ? 'text-blue-700'
                                      : 'text-gray-600'
                                  }
                                >
                                  {point.location_name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
