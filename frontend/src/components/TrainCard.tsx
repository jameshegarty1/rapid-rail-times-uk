import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrainFront as TrainIcon, ChevronUp, ChevronDown, Clock } from 'lucide-react';
import { Train } from '@/utils/interfaces';

interface TrainCardProps {
  train: Train;
  index: number;
  isExpanded?: boolean;
  toggleExpand: (index: number) => void;
  destinations: string[];
}

export default function TrainCard({
  train,
  index,
  isExpanded,
  toggleExpand,
  destinations,
}: TrainCardProps) {
  const isDelayed = train.estimated_departure !== 'On time';

  console.log('TrainCard', train);

  return (
    <Card
      key={index}
      className="bg-white hover:shadow-md transition-shadow cursor-pointer max-w-2xl mx-auto"
      onClick={(e) => {
        e.stopPropagation();
        toggleExpand(index);
      }}
    >
      <CardContent className="p-4 sm:p-6">
        {/* Main content */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start space-x-3">
            <TrainIcon
              className={`h-5 w-5 flex-shrink-0 ${
                isDelayed ? 'text-red-500' : 'text-blue-500'
              }`}
            />
            <div className="min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-medium text-lg">
                  {train.scheduled_departure}
                </span>
                <Badge
                  variant={isDelayed ? 'destructive' : 'default'}
                  className={`
                    ${
                      isDelayed
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }
                  `}
                >
                  {train.estimated_departure}
                </Badge>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <span className="font-medium">{train.origin}</span>
                <span className="mx-1">to</span>
                <span className="font-medium">{train.destination}</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {train.via && (
                    <div className="text-gray-500 text-xs">
                      <span className="font-medium">{train.via}</span>
                    </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center -my-2">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              <div className="bg-gray-50 px-2 py-1 rounded">
                <p className="text-gray-500 text-xs leading-tight">Platform</p>
                <p className="font-medium text-sm leading-tight">{train.platform || 'TBA'}</p>
              </div>
              <div className="bg-gray-50 px-2 py-1 rounded-lg">
                <p className="text-gray-500 text-xs leading-tight">Coaches</p>
                <p className= "font-medium text-sm leading-tight">{train.length}</p>
              </div>
              <div className="bg-gray-50 px-2 py-1 rounded ">
                <p className="text-gray-500 text-xs leading-tight">Operator</p>
                <p className="font-medium text-sm leading-tight truncate">{train.operator}</p>
              </div>
            </div>

            {train.subsequent_calling_points?.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Calling at:
                </p>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                  {train.subsequent_calling_points.map((point, idx) => {
                    const isDestination = destinations.includes(point.crs);
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-lg
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
                          className={`truncate ml-2 ${
                            isDestination ? 'text-blue-700' : 'text-gray-600'
                          }`}
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
}
