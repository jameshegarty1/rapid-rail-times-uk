import React, {useMemo} from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrainFront as TrainIcon,
  ChevronUp,
  ChevronDown,
  Clock,
} from 'lucide-react';
import { Train } from '@/utils/interfaces';
import {getStatusInfo, getDelayMinutes, addMinutesToTime} from '@/lib/utils';

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
  const statusInfo = getStatusInfo(train.estimated_departure);
  const isCancelled = statusInfo.text == 'Cancelled';
  const isDelayed = statusInfo.color == 'yellow';
  const delayMinutes = getDelayMinutes(
    train.scheduled_departure,
    train.estimated_departure
  );

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
                statusInfo.color === 'green' ? 'text-blue-500' : 'text-red-500'
              }`}
            />
            <div className="min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-medium text-lg">
                  {train.scheduled_departure}
                </span>
                <Badge
                  variant={
                    statusInfo.color === 'green' ? 'default' : 'destructive'
                  }
                  className={`
                    ${
                      statusInfo.color === 'green'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : statusInfo.color === 'yellow'
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }
                  `}
                >
                  {statusInfo.text}
                  {delayMinutes > 0 && ` (+${delayMinutes} min)`}
                </Badge>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <span className="font-medium">{train.origin}</span>
                <span className="mx-1">to</span>
                <span className="font-medium">{train.destination_name}</span>
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
                <p className="font-medium text-sm leading-tight">
                  {train.platform || 'TBA'}
                </p>
              </div>
              <div className="bg-gray-50 px-2 py-1 rounded-lg">
                <p className="text-gray-500 text-xs leading-tight">Coaches</p>
                <p className="font-medium text-sm leading-tight">
                  {train.coaches}
                </p>
              </div>
              <div className="bg-gray-50 px-2 py-1 rounded ">
                <p className="text-gray-500 text-xs leading-tight">Operator</p>
                <p className="font-medium text-sm leading-tight truncate">
                  {train.operator}
                </p>
              </div>
            </div>

            {!isCancelled && train.subsequent_calling_points?.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Calling at:
                </p>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                  {train.subsequent_calling_points.map((point, idx) => {
                    const isDestination = destinations.includes(point.crs);
                    const displayTime =
                      delayMinutes > 0
                        ? addMinutesToTime(point.scheduled_time, delayMinutes)
                        : train.estimated_departure === 'On time'
                        ? point.scheduled_time
                        : 'Delayed';
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
                            {displayTime}
                            {delayMinutes > 0 && (
                              <span className="text-red-600 text-xs ml-1">
                                (+{delayMinutes})
                              </span>
                            )}
                          </span>
                        </div>
                        <span
                          className={`truncate ml-2 ${
                            isDestination ? 'text-blue-700' : 'text-gray-600'
                          }`}
                        >
                          {point.station_name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {(isCancelled || isDelayed) && (
                <div className="mt-2 mb-3">
                  <div className={`${
                      isCancelled ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
                  } border-l-4 p-4 rounded`}>
                    <div className="flex">
                      <div>
                        <p className={`text-sm ${
                            isCancelled ? 'text-red-700' : 'text-yellow-800'
                        }`}>
                          {isCancelled
                              ? (train.cancel_reason || 'This train has been cancelled. Please check other services.')
                              : (train.delay_reason || 'This train is delayed. Please check the departure boards for updates.')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
            )}

          </div>
        )}
      </CardContent>
    </Card>
  );
}
