import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Train } from '../utils/interfaces';

import stationData from '../config/stations.json';
import TrainCard from '@/components/TrainCard';

const createAlphaToNameMap = (stations: { ALPHA: string; NAME: string }[]) => {
  const map: { [key: string]: string } = {};
  stations.forEach((station) => {
    map[station.ALPHA] = station.NAME;
  });
  return map;
};

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
          <div key={train.service_id} className="mb-6 sm:mb-6">
            <TrainCard
              train={train}
              index={index}
              isExpanded={isExpanded}
              toggleExpand={toggleExpand}
              destinations={destinations}
            />
          </div>
        );
      })}
    </div>
  );
}
